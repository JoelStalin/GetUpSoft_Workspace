// Nodo staffing-agency-discovery (node-inventory.json: "Portales de agencias; se configuran
// por profesion del cliente"). A diferencia de LinkedIn/Indeed/Dice, este NO es un portal
// fijo: cada cliente puede tener agencias de staffing distintas segun su profesion. Por eso
// recibe la configuracion del portal como parametro (no hardcodea ningun sitio), reutilizando
// el mismo core de discovery/paginacion/filtro/deteccion-de-bloqueo ya probado.
import { makeRelevanceFilter, discoverJobsPaginated } from './job-discovery-core.mjs';

// Config de un portal de agencia: como se construye la URL de busqueda por pagina, y como se
// extraen las tarjetas de vacante de su DOM. Cada cliente/profesion aporta la suya — este
// modulo no asume ningun sitio en particular.
export function buildAgencyPortalConfig({
  portalName,
  baseUrl, // ej: 'https://agencia.example/empleos'
  searchParam = 'q',
  pageParam = 'page',
  cardSelector,
  titleSelector,
  companySelector,
  locationSelector,
} = {}) {
  if (!portalName) throw new Error('buildAgencyPortalConfig necesita portalName');
  if (!baseUrl) throw new Error('buildAgencyPortalConfig necesita baseUrl');
  if (!cardSelector || !titleSelector) throw new Error('buildAgencyPortalConfig necesita cardSelector y titleSelector para poder leer el DOM del portal');
  return { portalName, baseUrl, searchParam, pageParam, cardSelector, titleSelector, companySelector, locationSelector };
}

async function scrapeCurrentPage(page, config) {
  return page.evaluate(({ cardSelector, titleSelector, companySelector, locationSelector, baseUrl }) => {
    const cards = Array.from(document.querySelectorAll(cardSelector));
    return cards.map((card) => {
      const titleEl = card.querySelector(titleSelector);
      const companyEl = companySelector ? card.querySelector(companySelector) : null;
      const locationEl = locationSelector ? card.querySelector(locationSelector) : null;
      const link = titleEl?.getAttribute('href') || null;
      let absoluteLink = null;
      try { absoluteLink = link ? new URL(link, baseUrl).href.split('?')[0] : null; } catch { absoluteLink = null; }
      return {
        title: titleEl?.innerText?.trim() || null,
        company: companyEl?.innerText?.trim() || null,
        location: locationEl?.innerText?.trim() || null,
        link: absoluteLink,
      };
    });
  }, config);
}

// keywords y termPatterns vienen del perfil confirmado del cliente (rankedFamilies / catalogo
// de profesiones), no de un stack cableado — este nodo sirve para cualquier profesion, no solo
// tecnologia.
export async function discoverStaffingAgencyJobs(runId, {
  page,
  portalConfig,
  keywords,
  termPatterns,
  maxResults = 5,
  maxPages = 3,
  screenshotPath = null,
} = {}) {
  if (!portalConfig) throw new Error('discoverStaffingAgencyJobs necesita portalConfig (ver buildAgencyPortalConfig)');
  if (!keywords) throw new Error('discoverStaffingAgencyJobs necesita keywords (del perfil confirmado del cliente)');
  if (!Array.isArray(termPatterns) || !termPatterns.length) {
    throw new Error('discoverStaffingAgencyJobs necesita termPatterns para saber que es relevante; sin eso aceptaria cualquier resultado del portal a ciegas');
  }

  const isRelevant = makeRelevanceFilter(termPatterns);
  const nodeId = `staffing-agency-discovery:${portalConfig.portalName}`;

  return discoverJobsPaginated(runId, nodeId, {
    page,
    buildPageUrl: (pageIndex) => {
      const url = new URL(portalConfig.baseUrl);
      url.searchParams.set(portalConfig.searchParam, keywords);
      if (pageIndex > 0) url.searchParams.set(portalConfig.pageParam, String(pageIndex + 1));
      return url.href;
    },
    scrapePage: (p) => scrapeCurrentPage(p, portalConfig),
    isRelevant,
    maxResults, maxPages, screenshotPath,
    extra: { portal: portalConfig.portalName, keywords },
  });
}
