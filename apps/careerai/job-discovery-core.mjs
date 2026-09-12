// Logica compartida de discovery entre portales (LinkedIn, Dice, agencias de staffing):
// filtro de relevancia por termino en titulo, dedup por link, deteccion de checkpoint/captcha,
// y el bucle de paginacion con throttling. Extraida DESPUES de construir linkedin-jobs-node.mjs
// (que se deja intacto, ya probado en vivo, para no arriesgar romperlo) para que
// dice-discovery.mjs y staffing-agency-discovery.mjs no dupliquen la misma logica con el mismo
// bug potencial (el filtro de relevancia real que corrigio el caso real de LinkedIn:
// 7 resultados, 0 relevantes, porque el buscador matcheaba el termino en cualquier parte de
// la vacante, no solo el titulo).
import { withNodeExecution } from './execution-debug.mjs';

// Fabrica de un filtro de relevancia: recibe los patrones que identifican el stack (o la
// profesion) y devuelve una funcion que solo acepta una vacante si el termino aparece en el
// TITULO — nunca solo por aparecer en la descripcion/ubicacion, que es lo que produce falsos
// positivos masivos con buscadores por palabras clave sueltas.
export function makeRelevanceFilter(termPatterns) {
  return function isRelevant(job) {
    const title = job.title || '';
    return termPatterns.some((re) => re.test(title));
  };
}

function dedupeByLink(jobs) {
  const seen = new Set();
  const out = [];
  for (const job of jobs) {
    if (!job.link || seen.has(job.link)) continue;
    seen.add(job.link);
    out.push(job);
  }
  return out;
}

// Parte pura: filtra y limita el resultado crudo. No toca el navegador.
export function processRawResults(rawJobs, isRelevant, { maxResults = 5 } = {}) {
  const deduped = dedupeByLink(rawJobs.filter((j) => j.title && j.link));
  const relevant = deduped.filter(isRelevant);
  const discarded = deduped.filter((j) => !isRelevant(j));
  return {
    total_scraped: rawJobs.length,
    total_deduped: deduped.length,
    relevant: relevant.slice(0, maxResults),
    discarded_as_noise: discarded.map((j) => ({ title: j.title, company: j.company })),
  };
}

// Guarda de checkpoint/captcha generica: para y reporta, nunca intenta esquivarlo. Los mismos
// patrones que ya demostraron funcionar en la corrida real de LinkedIn.
export function detectBlocked(url, bodyText) {
  const urlBlocked = /\/checkpoint\/|\/authwall|challenge|\/blocked\b/.test(url || '');
  const textBlocked = /verify.{0,20}(it.?s you|human)|security check|unusual activity|captcha|access denied/i.test(bodyText || '');
  return urlBlocked || textBlocked;
}

function jitter(minMs, maxMs) {
  return new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
}

// Bucle de paginacion generico: `buildPageUrl(pageIndex)` construye la URL de cada pagina,
// `scrapePage(page)` devuelve las tarjetas crudas de la pagina actual. El resto (throttling,
// deteccion de bloqueo, parada por max_results/no_more_results/max_pages, dedup, filtro) es
// identico para cualquier portal — se corrigio una sola vez para LinkedIn y se reutiliza aqui.
export async function discoverJobsPaginated(runId, nodeId, {
  page,
  buildPageUrl,
  scrapePage,
  isRelevant,
  maxResults = 5,
  maxPages = 3,
  screenshotPath = null,
  extra = {},
} = {}) {
  if (!page) throw new Error(`${nodeId} necesita un page ya logueado`);

  return withNodeExecution(runId, nodeId, async () => {
    const allRaw = [];
    let pagesFetched = 0;
    let stoppedReason = 'max_results_reached';

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
      const url = buildPageUrl(pageIndex);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (pageIndex > 0) await jitter(2000, 4000);

      const currentUrl = typeof page.url === 'function' ? page.url() : url;
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => '');
      if (detectBlocked(currentUrl, bodyText)) {
        if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
        return {
          ok: false, status: 'blocked', blocked_at: 'portal_checkpoint',
          reason: 'el portal pidio verificacion/checkpoint/captcha', url: currentUrl,
          pages_fetched: pagesFetched, applied: false, ...extra,
        };
      }

      const rawJobs = await scrapePage(page);
      pagesFetched += 1;
      const newLinks = rawJobs.filter((j) => j.link && !allRaw.some((existing) => existing.link === j.link));
      if (newLinks.length === 0 && pageIndex > 0) {
        stoppedReason = 'no_more_results';
        break;
      }
      allRaw.push(...rawJobs);

      const relevantSoFar = processRawResults(allRaw, isRelevant, { maxResults }).relevant;
      if (relevantSoFar.length >= maxResults) { stoppedReason = 'max_results_reached'; break; }
      if (pageIndex === maxPages - 1) stoppedReason = 'max_pages_reached';
    }

    const processed = processRawResults(allRaw, isRelevant, { maxResults });
    if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});

    return {
      ok: true, status: 'completed',
      pages_fetched: pagesFetched,
      stopped_reason: stoppedReason,
      ...processed,
      returned: processed.relevant.length,
      mode: 'discovery_only',
      applied: false,
      ...extra,
    };
  });
}
