import { parseFeed, ingestJobAlert, extractAlertLinks } from '../apps/orca/src/careerai/feed-ingest.mjs';

const NL = String.fromCharCode(10);

// --- RSS ---------------------------------------------------------------------
const rss = [
  '<?xml version="1.0"?><rss version="2.0"><channel>',
  '<title>Ofertas</title>',
  '<item>',
  '  <title>Analista de Sistemas &amp; Datos</title>',
  '  <link>https://board.example/jobs/1?utm_source=rss&amp;utm_medium=feed</link>',
  '  <description><![CDATA[<p>Puesto <b>remoto</b> para empresa del sector salud.</p>]]></description>',
  '  <pubDate>Wed, 26 Aug 2026 10:00:00 GMT</pubDate>',
  '</item>',
  '<item>',
  '  <title>Sin enlace</title>',
  '  <description>Esta entrada no trae link</description>',
  '</item>',
  '</channel></rss>',
].join(NL);

const feed = parseFeed(rss, { source: 'board-example' });
if (!feed.ok) throw new Error('Un RSS valido debe parsearse');
if (feed.entries_found !== 2) throw new Error('Debe contar las dos entradas');
if (feed.items.length !== 1) throw new Error('Solo la entrada con enlace es utilizable');
if (feed.skipped_without_url !== 1) throw new Error('Debe reportar lo descartado, no ocultarlo');

const item = feed.items[0];
if (item.title !== 'Analista de Sistemas & Datos') throw new Error(`Debe decodificar entidades: ${item.title}`);
if (item.canonical_url !== 'https://board.example/jobs/1') throw new Error(`Debe limpiar los parametros de seguimiento: ${item.canonical_url}`);
if (!item.description.includes('remoto') || item.description.includes('<b>')) throw new Error('Debe extraer el texto sin etiquetas HTML');
if (!item.published_at.startsWith('2026-08-26')) throw new Error('Debe normalizar la fecha a ISO');

// --- Atom: el enlace va en un atributo, no en el texto -----------------------
const atom = [
  '<feed xmlns="http://www.w3.org/2005/Atom">',
  '<entry>',
  '  <title>Puesto Atom</title>',
  '  <link rel="alternate" href="https://board.example/jobs/2"/>',
  '  <summary>Resumen del puesto</summary>',
  '  <updated>2026-08-25T09:00:00Z</updated>',
  '</entry>',
  '</feed>',
].join(NL);
const feedAtom = parseFeed(atom, { source: 'atom-example' });
if (feedAtom.items[0]?.canonical_url !== 'https://board.example/jobs/2') throw new Error('Debe leer el href de Atom');
if (!feedAtom.items[0].published_at.startsWith('2026-08-25')) throw new Error('Atom usa updated/published');

// Un feed vacio o sin entradas puede ser un error del portal disfrazado de 200.
if (parseFeed('').status !== 'empty_feed') throw new Error('Feed vacio debe declararse');
if (parseFeed('<rss><channel></channel></rss>').status !== 'no_entries') throw new Error('Feed sin entradas debe declararse');

// --- alertas por correo ------------------------------------------------------
const alerta = {
  from: 'Job Alerts <alerts@board.example>',
  subject: 'Nuevas ofertas para ti',
  body: 'Mira estas ofertas: https://board.example/jobs/10 y https://board.example/jobs/11 . Baja aqui https://board.example/unsubscribe',
};

const ingesta = ingestJobAlert(alerta, { allowedSenders: ['board.example'], allowedJobHosts: ['board.example'] });
if (!ingesta.ok || ingesta.status !== 'ingested') throw new Error('Una alerta de remitente permitido debe ingerirse');
if (ingesta.items.length !== 3) throw new Error(`Esperaba 3 enlaces unicos, obtuve ${ingesta.items.length}`);
if (!ingesta.items.every((entry) => entry.needs_enrichment)) throw new Error('La alerta solo aporta el enlace');

// Remitente no permitido: seguir sus enlaces es como funciona el phishing.
const falsa = ingestJobAlert({ ...alerta, from: 'Ofertas <ofertas@dominio-raro.example>' }, { allowedSenders: ['board.example'] });
if (falsa.ok !== false || falsa.status !== 'rejected') throw new Error('Un remitente no permitido debe rechazarse');
if (falsa.items.length !== 0) throw new Error('De un remitente rechazado no se toma ningun enlace');

const sinRemitente = ingestJobAlert({ body: 'https://board.example/jobs/1' }, { allowedSenders: ['board.example'] });
if (sinRemitente.ok !== false) throw new Error('Sin remitente identificable se rechaza');

// El enlace real viene envuelto en un rastreador: hay que desenvolverlo.
const envuelto = extractAlertLinks(
  'https://tracker.example/click?u=https%3A%2F%2Fboard.example%2Fjobs%2F77&campaign=x',
  { allowedJobHosts: ['board.example'] },
);
if (envuelto[0]?.canonical_url !== 'https://board.example/jobs/77') {
  throw new Error(`Debe desenvolver el enlace del rastreador: ${JSON.stringify(envuelto)}`);
}

// Hosts fuera de la lista de portales no entran aunque el remitente sea valido.
const soloPortal = extractAlertLinks('https://board.example/jobs/1 https://facebook.com/promo', { allowedJobHosts: ['board.example'] });
if (soloPortal.length !== 1) throw new Error('Solo los hosts de portales permitidos entran');

// Duplicados: el mismo enlace con distinto rastreo es uno solo.
const duplicados = extractAlertLinks('https://board.example/j/1?utm_source=a https://board.example/j/1?utm_source=b', { allowedJobHosts: ['board.example'] });
if (duplicados.length !== 1) throw new Error('El mismo enlace con distinto rastreo no se cuenta dos veces');

console.log(JSON.stringify({
  ok: true,
  nodes: ['rss-feed-ingest', 'email-alert-ingest'],
  formatos: ['RSS', 'Atom'],
  sin_riesgo_antibot: true,
  remitente_verificado: true,
  enlaces_desenvueltos: true,
}));
