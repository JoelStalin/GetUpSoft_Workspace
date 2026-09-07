// Nodo ejecutable real de busqueda LinkedIn (discovery-only, nunca postula). A diferencia de
// scripts/careerai_linkedin_jobs_search.mjs (el script suelto de la primera corrida manual,
// 2026-09-07), esto es un NODO del workflow: registra su ejecucion via execution-debug.mjs
// (input/output real, inspeccionable desde el canvas de ORCA) y separa la logica pura
// (filtrado de relevancia, dedup) de la parte que si necesita un navegador real, para poder
// testear la parte que importa sin levantar Chrome.
//
// Gap que corrige: la primera corrida trajo 7 resultados y 0 relevantes ("Incoming
// Technician", "Business Analyst" contra un OR de AS400/iSeries/RPG) porque LinkedIn matchea
// el OR contra cualquier parte de la vacante, no solo el titulo. El filtro de relevancia real
// pasa aqui, en el lado que se puede probar sin navegador — no se puede confiar solo en el
// resultado crudo de LinkedIn.
import { withNodeExecution } from './execution-debug.mjs';

export const DEFAULT_KEYWORDS = '"AS400" OR "AS/400" OR iSeries OR "IBM i" OR RPG OR RPGLE OR "System i"';

// Terminos que de verdad identifican una vacante del stack, para filtrar el ruido del OR de
// LinkedIn. Se busca en titulo (peso alto) y en el resto (peso bajo, solo si el titulo ya dio
// una senal parcial) — un titulo como "Business Analyst" sin ninguna de estas palabras no
// pasa, aunque la descripcion mencione "RPG" de pasada (p. ej. un RPG de videojuegos, ya visto
// como falso positivo en stack-classifier.mjs).
const STACK_TERMS = [/\bas\s?\/?400\b/i, /\biseries\b/i, /\bibm\s?i\b/i, /\brpg\s?le?\b/i, /\bsystem\s?i\b/i];

export function isRelevantToStack(job) {
  const title = job.title || '';
  const inTitle = STACK_TERMS.some((re) => re.test(title));
  if (inTitle) return true;
  // Sin señal en el titulo, no se acepta solo por aparecer en la descripcion/ubicacion — eso
  // es exactamente lo que produjo los 7 falsos positivos de la corrida anterior.
  return false;
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

// Parte pura: dado el resultado crudo (lo que devuelve el scrape del DOM), filtra y limita.
// No toca el navegador — esto es lo que el test cubre sin levantar Chrome.
export function processRawResults(rawJobs, { maxResults = 5 } = {}) {
  const deduped = dedupeByLink(rawJobs.filter((j) => j.title && j.link));
  const relevant = deduped.filter(isRelevantToStack);
  const discarded = deduped.filter((j) => !isRelevantToStack(j));
  return {
    total_scraped: rawJobs.length,
    total_deduped: deduped.length,
    relevant: relevant.slice(0, maxResults),
    discarded_as_noise: discarded.map((j) => ({ title: j.title, company: j.company })),
  };
}

// Guarda de checkpoint/captcha: para y reporta, nunca intenta esquivarlo. Parte pura, testeada
// sin navegador con un url/bodyText fabricados.
export function detectBlocked(url, bodyText) {
  const urlBlocked = /\/checkpoint\/|\/authwall|challenge/.test(url || '');
  const textBlocked = /verify.{0,20}(it.?s you|human)|security check|unusual activity|captcha/i.test(bodyText || '');
  return urlBlocked || textBlocked;
}

// Nodo completo: recibe un `page` de Playwright ya logueado (inyectado, no lo abre este
// modulo) y un runId para grabar la ejecucion. `page` puede ser un doble de prueba con
// goto/url/evaluate/screenshot — eso es lo que permite testear el flujo completo del nodo sin
// Chrome real.
async function scrapeCurrentPage(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div.job-card-container, li.jobs-search-results__list-item, div[data-job-id]'));
    return cards.map((card) => {
      const titleEl = card.querySelector('a.job-card-list__title, a.job-card-container__link, .job-card-list__title');
      const companyEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, .job-card-container__company-name');
      const locationEl = card.querySelector('.job-card-container__metadata-item, .artdeco-entity-lockup__caption');
      const link = titleEl?.getAttribute('href') || null;
      return {
        title: titleEl?.innerText?.trim() || null,
        company: companyEl?.innerText?.trim() || null,
        location: locationEl?.innerText?.trim() || null,
        link: link ? new URL(link, 'https://www.linkedin.com').href.split('?')[0] : null,
      };
    });
  });
}

function jitter(minMs, maxMs) {
  return new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
}

// maxPages/pageSize: LinkedIn Jobs pagina con &start=0,25,50,... Se para en cuanto se junta
// maxResults relevantes, se agota maxPages, o LinkedIn deja de devolver tarjetas nuevas (fin
// real de resultados) — nunca seguir pidiendo paginas "por si acaso". Throttling real entre
// paginas (no entre acciones sueltas dentro de una pagina) para no verse como un bot barriendo
// resultados a maxima velocidad.
export async function discoverLinkedInJobs(runId, {
  page,
  keywords = DEFAULT_KEYWORDS,
  maxResults = 5,
  maxPages = 3,
  pageSize = 25,
  screenshotPath = null,
} = {}) {
  if (!page) throw new Error('discoverLinkedInJobs necesita un page ya logueado');
  const baseUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&sortBy=DD`;

  return withNodeExecution(runId, 'linkedin-jobs-search', async () => {
    const allRaw = [];
    let pagesFetched = 0;
    let stoppedReason = 'max_results_reached';

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
      const start = pageIndex * pageSize;
      const url = start === 0 ? baseUrl : `${baseUrl}&start=${start}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (pageIndex > 0) await jitter(2000, 4000);

      const currentUrl = typeof page.url === 'function' ? page.url() : url;
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => '');
      if (detectBlocked(currentUrl, bodyText)) {
        if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
        return {
          ok: false, status: 'blocked', blocked_at: 'linkedin_checkpoint',
          reason: 'LinkedIn pidio verificacion/checkpoint/captcha', url: currentUrl,
          pages_fetched: pagesFetched, applied: false,
        };
      }

      const rawJobs = await scrapeCurrentPage(page);
      pagesFetched += 1;
      const newLinks = rawJobs.filter((j) => j.link && !allRaw.some((existing) => existing.link === j.link));
      if (newLinks.length === 0 && pageIndex > 0) {
        // LinkedIn dejo de devolver tarjetas nuevas: es el fin real de resultados, no un
        // fallo — no tiene sentido seguir pidiendo paginas vacias.
        stoppedReason = 'no_more_results';
        break;
      }
      allRaw.push(...rawJobs);

      const relevantSoFar = processRawResults(allRaw, { maxResults }).relevant;
      if (relevantSoFar.length >= maxResults) { stoppedReason = 'max_results_reached'; break; }
      if (pageIndex === maxPages - 1) stoppedReason = 'max_pages_reached';
    }

    const processed = processRawResults(allRaw, { maxResults });
    if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});

    return {
      ok: true, status: 'completed',
      keywords, search_url: baseUrl,
      pages_fetched: pagesFetched,
      stopped_reason: stoppedReason,
      ...processed,
      returned: processed.relevant.length,
      mode: 'discovery_only',
      applied: false,
    };
  });
}
