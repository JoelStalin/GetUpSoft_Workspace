// Nodo dice-discovery (node-inventory.json: "Adaptador de Dice; fuerte en perfiles tecnicos y
// de contrato"). Discovery-only, nunca postula. Sobre job-discovery-core.mjs — sin sesion real
// de Dice disponible en esta sesion para probarlo en vivo (a diferencia de LinkedIn); los
// selectores del DOM son el mejor esfuerzo segun el markup publico de Dice y quedan
// explicitamente marcados como PENDIENTES DE VERIFICACION REAL antes de confiar en ellos para
// una corrida real — no se afirma que esto ya se probo contra Dice de verdad.
import { makeRelevanceFilter, discoverJobsPaginated } from './job-discovery-core.mjs';

export const DEFAULT_KEYWORDS = 'AS400 iSeries "IBM i" RPG RPGLE';

const STACK_TERMS = [/\bas\s?\/?400\b/i, /\biseries\b/i, /\bibm\s?i\b/i, /\brpg\s?le?\b/i, /\bsystem\s?i\b/i];
export const isRelevantToStack = makeRelevanceFilter(STACK_TERMS);

async function scrapeCurrentPage(page) {
  return page.evaluate(() => {
    // Selectores segun el markup publico de dice.com al momento de escribir esto — NO
    // verificados contra una sesion real. Si Dice cambio su markup, esto devolvera 0
    // resultados de forma silenciosa (ver aviso en discoverDiceJobs).
    const cards = Array.from(document.querySelectorAll('div[data-testid="job-search-serp-card"], div.search-card, dhi-search-card'));
    return cards.map((card) => {
      const titleEl = card.querySelector('a[data-testid="job-search-serp-card-title"], a.card-title-link, h5 a');
      const companyEl = card.querySelector('a[data-testid="company-name"], .company-name, .search-result-company-name');
      const locationEl = card.querySelector('[data-testid="job-search-serp-card-location"], .search-result-location');
      const link = titleEl?.getAttribute('href') || null;
      return {
        title: titleEl?.innerText?.trim() || null,
        company: companyEl?.innerText?.trim() || null,
        location: locationEl?.innerText?.trim() || null,
        link: link ? new URL(link, 'https://www.dice.com').href.split('?')[0] : null,
      };
    });
  });
}

export async function discoverDiceJobs(runId, {
  page,
  keywords = DEFAULT_KEYWORDS,
  maxResults = 5,
  maxPages = 3,
  screenshotPath = null,
} = {}) {
  const result = await discoverJobsPaginated(runId, 'dice-discovery', {
    page,
    buildPageUrl: (pageIndex) => `https://www.dice.com/jobs?q=${encodeURIComponent(keywords)}&page=${pageIndex + 1}`,
    scrapePage: scrapeCurrentPage,
    isRelevant: isRelevantToStack,
    maxResults, maxPages, screenshotPath,
    extra: { portal: 'dice', keywords },
  });
  if (result.ok && result.total_scraped === 0) {
    // 0 scrapeados en TODAS las paginas es sospechoso — mas probable que el markup cambio y
    // los selectores ya no matchean nada, que Dice de verdad no tenga ninguna vacante.
    return { ...result, warning: 'selectores_no_verificados_0_resultados: revisar el markup real de Dice antes de confiar en este 0' };
  }
  return result;
}
