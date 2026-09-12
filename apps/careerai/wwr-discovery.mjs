// Nodo wwr-discovery: adaptador de WeWorkRemotely sobre job-discovery-core.mjs. Mismo aviso
// que dice-discovery.mjs: sin sesion real de WeWorkRemotely disponible en esta sesion para
// probarlo en vivo, los selectores son el mejor esfuerzo segun el markup publico y quedan
// marcados como PENDIENTES DE VERIFICACION REAL.
import { makeRelevanceFilter, discoverJobsPaginated } from './job-discovery-core.mjs';

export const DEFAULT_KEYWORDS = 'AS400 iSeries "IBM i" RPG RPGLE';

const STACK_TERMS = [/\bas\s?\/?400\b/i, /\biseries\b/i, /\bibm\s?i\b/i, /\brpg\s?le?\b/i, /\bsystem\s?i\b/i];
export const isRelevantToStack = makeRelevanceFilter(STACK_TERMS);

async function scrapeCurrentPage(page) {
  return page.evaluate(() => {
    // Selectores segun el markup publico de weworkremotely.com al momento de escribir esto —
    // NO verificados contra una sesion real. Si cambia el markup, esto devuelve 0 resultados
    // de forma silenciosa (ver aviso en discoverWwrJobs).
    const cards = Array.from(document.querySelectorAll('li.feature, section.jobs article li:not(.view-all)'));
    return cards.map((card) => {
      const titleEl = card.querySelector('span.title, .job-title');
      const companyEl = card.querySelector('span.company, .company');
      const regionEl = card.querySelector('span.region, .region');
      const linkEl = card.querySelector('a[href^="/remote-jobs/"]');
      const link = linkEl?.getAttribute('href') || null;
      return {
        title: titleEl?.innerText?.trim() || null,
        company: companyEl?.innerText?.trim() || null,
        location: regionEl?.innerText?.trim() || 'Remote',
        link: link ? new URL(link, 'https://weworkremotely.com').href.split('?')[0] : null,
      };
    });
  });
}

export async function discoverWwrJobs(runId, {
  page,
  keywords = DEFAULT_KEYWORDS,
  maxResults = 5,
  maxPages = 3,
  screenshotPath = null,
} = {}) {
  const result = await discoverJobsPaginated(runId, 'wwr-discovery', {
    page,
    buildPageUrl: (pageIndex) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(keywords)}&page=${pageIndex + 1}`,
    scrapePage: scrapeCurrentPage,
    isRelevant: isRelevantToStack,
    maxResults, maxPages, screenshotPath,
    extra: { portal: 'weworkremotely', keywords },
  });
  if (result.ok && result.total_scraped === 0) {
    return { ...result, warning: 'selectores_no_verificados_0_resultados: revisar el markup real de WeWorkRemotely antes de confiar en este 0' };
  }
  return result;
}
