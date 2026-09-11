// Nodos rss-feed-ingest y email-alert-ingest.
//
// Son las dos fuentes que NO disparan proteccion anti-bot: un feed RSS es un documento
// publico pensado para ser leido por maquinas, y una alerta de empleo ya llego al correo del
// cliente. Despues del muro de Cloudflare que freno el scraping en Indeed y WeWorkRemotely,
// estas son las vias mas fiables y las mas baratas.
//
// El parseo es propio a proposito: meter un parser XML completo para leer cuatro etiquetas
// anadiria una dependencia que hay que mantener y auditar.
import { canonicalizeUrl } from './dedupe.mjs';

function decodeEntities(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    // El & se resuelve al final para no romper las entidades anteriores.
    .replace(/&amp;/g, '&');
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function pick(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : null;
}

// Atom usa <link href="..."/> en vez de <link>texto</link>.
function pickLink(block) {
  const atom = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (atom) return atom[1].trim();
  return pick(block, 'link');
}

export function parseFeed(xml, { source = 'rss', limit = 50 } = {}) {
  if (!xml || typeof xml !== 'string') {
    return { ok: false, status: 'empty_feed', reason: 'el feed vino vacio', items: [] };
  }

  const bloques = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || [];
  if (!bloques.length) {
    // Un feed sin entradas puede ser un error del portal disfrazado de 200.
    return { ok: false, status: 'no_entries', reason: 'el feed no contiene item ni entry', items: [] };
  }

  const items = [];
  for (const bloque of bloques.slice(0, limit)) {
    const url = canonicalizeUrl(pickLink(bloque));
    if (!url) continue;
    const descripcion = pick(bloque, 'description') || pick(bloque, 'summary') || pick(bloque, 'content');
    items.push({
      source,
      title: stripTags(pick(bloque, 'title')) || null,
      canonical_url: url,
      company: stripTags(pick(bloque, 'author') || pick(bloque, 'dc:creator')) || null,
      description: stripTags(descripcion) || null,
      published_at: normalizeDate(pick(bloque, 'pubDate') || pick(bloque, 'published') || pick(bloque, 'updated')),
    });
  }

  return {
    ok: true,
    status: 'ingested',
    source,
    entries_found: bloques.length,
    items,
    // Se reporta lo descartado en vez de dejar que la cuenta no cuadre en silencio.
    skipped_without_url: bloques.length - items.length,
  };
}

function normalizeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

// --- email-alert-ingest ------------------------------------------------------
// Las alertas de empleo llegan al correo del cliente antes de que la vacante circule, y
// leerlas no toca el portal. El remitente debe estar en la allowlist: cualquiera puede enviar
// un correo que parezca una alerta, y seguir sus enlaces a ciegas es un riesgo real.
const REDIRECT_PARAMS = ['url', 'u', 'redirect', 'target', 'link', 'destination'];

export function extractAlertLinks(body, { allowedJobHosts = [] } = {}) {
  const hrefs = [...String(body || '').matchAll(/https?:\/\/[^\s"'<>)\]]+/gi)].map((match) => match[0]);
  const vistos = new Set();
  const enlaces = [];

  for (const href of hrefs) {
    let url = href.replace(/[.,;]+$/, '');
    // Los correos de alerta envuelven el enlace real en un rastreador; se desenvuelve.
    try {
      const parsed = new URL(url);
      for (const param of REDIRECT_PARAMS) {
        const inner = parsed.searchParams.get(param);
        if (inner && /^https?:\/\//i.test(inner)) { url = inner; break; }
      }
    } catch { continue; }

    const canonical = canonicalizeUrl(url);
    if (!canonical || vistos.has(canonical)) continue;

    let host;
    try { host = new URL(canonical).host.toLowerCase().replace(/^www\./, ''); } catch { continue; }
    if (allowedJobHosts.length && !allowedJobHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) continue;

    vistos.add(canonical);
    enlaces.push({ canonical_url: canonical, host });
  }
  return enlaces;
}

export function ingestJobAlert(message = {}, { allowedSenders = [], allowedJobHosts = [] } = {}) {
  const from = String(message.from || '').toLowerCase();
  const senderDomain = from.match(/@([^\s>]+)/)?.[1] || null;

  if (!senderDomain) {
    return { ok: false, status: 'rejected', reason: 'el mensaje no tiene remitente identificable', items: [] };
  }
  if (allowedSenders.length && !allowedSenders.map((item) => item.toLowerCase()).some((allowed) => senderDomain === allowed || senderDomain.endsWith(`.${allowed}`))) {
    // Seguir enlaces de un remitente no verificado es exactamente como funciona el phishing.
    return { ok: false, status: 'rejected', reason: `remitente ${senderDomain} fuera de la lista permitida`, items: [] };
  }

  const enlaces = extractAlertLinks(`${message.body || ''} ${message.html || ''}`, { allowedJobHosts });
  return {
    ok: true,
    status: enlaces.length ? 'ingested' : 'no_links',
    source: 'email_alert',
    sender_domain: senderDomain,
    subject: message.subject || null,
    items: enlaces.map((item) => ({
      source: 'email_alert',
      canonical_url: item.canonical_url,
      host: item.host,
      title: null,
      // La alerta solo aporta el enlace; el detalle se lee despues en la propia oferta.
      needs_enrichment: true,
    })),
  };
}
