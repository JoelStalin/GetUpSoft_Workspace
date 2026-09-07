// Busqueda de ofertas AS400/iSeries/IBM i/RPG en LinkedIn Jobs, usando la sesion ya
// persistida (login manual del usuario, ver careerai_login_handoff.mjs). SOLO descubrimiento
// y listado: no rellena ni postula nada. Throttling real entre acciones (delays aleatorios)
// para no disparar deteccion de automatizacion. Si LinkedIn muestra checkpoint/verificacion/
// captcha, se detiene de inmediato y lo reporta — no lo intenta esquivar.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
fs.mkdirSync(OUT, { recursive: true });
const profileDir = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const maxResults = Number(process.env.LINKEDIN_SEARCH_MAX || 5);

// Sinonimos habituales del stack AS400/iSeries: se busca con OR para no perder ofertas que
// usan una terminologia distinta para lo mismo.
const KEYWORDS = '"AS400" OR "AS/400" OR iSeries OR "IBM i" OR RPG OR RPGLE OR "System i"';
const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(KEYWORDS)}&sortBy=DD`;

function jitter(minMs, maxMs) {
  return new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
}

const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1366, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = context.pages().length ? context.pages()[0] : await context.newPage();

console.log(JSON.stringify({ step: 'navigating', url: searchUrl }));
await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
await jitter(2000, 4000);

// --- guarda de checkpoint/captcha: parar y avisar, no esquivar --------------------
const currentUrl = page.url();
const bodyTextEarly = await page.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => '');
const blocked = /\/checkpoint\/|\/authwall|challenge/.test(currentUrl)
  || /verify.{0,20}(it.?s you|human)|security check|unusual activity|captcha/i.test(bodyTextEarly);
if (blocked) {
  await page.screenshot({ path: `${OUT}/linkedin-search-blocked.png` }).catch(() => {});
  console.log(JSON.stringify({
    ok: false, step: 'blocked', reason: 'LinkedIn pidio verificacion/checkpoint/captcha',
    url: currentUrl, screenshot: `${OUT}/linkedin-search-blocked.png`,
  }));
  await context.close();
  process.exit(1);
}

// --- extraer resultados: titulo, empresa, ubicacion, enlace -----------------------
await jitter(1500, 3000);
const results = await page.evaluate(() => {
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
  }).filter((item) => item.title && item.link);
});

// Deduplicar por link (LinkedIn a veces repite tarjetas al renderizar).
const seen = new Set();
const unique = [];
for (const item of results) {
  if (seen.has(item.link)) continue;
  seen.add(item.link);
  unique.push(item);
}
const top = unique.slice(0, maxResults);

await page.screenshot({ path: `${OUT}/linkedin-as400-search.png`, fullPage: false }).catch(() => {});

const report = {
  ok: true,
  step: 'linkedin_jobs_search_complete',
  keywords: KEYWORDS,
  search_url: searchUrl,
  total_found_on_page: unique.length,
  returned: top.length,
  jobs: top,
  screenshot: `${OUT}/linkedin-as400-search.png`,
  mode: 'discovery_only',
  applied: false,
};
fs.writeFileSync(`${OUT}/linkedin-as400-search.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await context.close();
