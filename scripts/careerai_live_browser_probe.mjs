// Prueba real de discovery contra portales de empleo, con navegador visible.
// NO inicia sesion, NO rellena credenciales y NO envia postulaciones.
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const targets = [
  { id: 'indeed', url: 'https://www.indeed.com/jobs?q=software+engineer&l=Remote' },
  { id: 'linkedin', url: 'https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=Remote' },
  { id: 'weworkremotely', url: 'https://weworkremotely.com/remote-jobs/search?term=software+engineer' },
];

const browser = await chromium.launch({ headless: false, slowMo: 300, args: ['--start-maximized'] });
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
const results = [];

for (const target of targets) {
  const record = { id: target.id, url: target.url };
  try {
    const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    record.http_status = response?.status() ?? null;
    await page.waitForTimeout(4000);
    const text = (await page.evaluate(() => document.body.innerText)).slice(0, 4000);
    record.final_url = page.url();
    record.blocked_by_bot_wall = /verify you are human|unusual traffic|are you a robot|captcha|challenge/i.test(text);
    record.login_wall = /sign in|log in|iniciar sesión/i.test(text) && /\/authwall|\/login|\/checkpoint/i.test(page.url());
    record.job_cards = await page.evaluate(() => document.querySelectorAll(
      '[data-testid*="job"], .job_seen_beacon, .jobs-search-results__list-item, li[data-occludable-job-id], section.jobs, article'
    ).length);
    await page.screenshot({ path: `${OUT}/${target.id}.png`, fullPage: false });
    record.screenshot = `${OUT}/${target.id}.png`;
  } catch (error) {
    record.error = String(error).split('\n')[0];
  }
  // Guarda de seguridad: en ningun caso se envia un formulario.
  record.submit_performed = false;
  results.push(record);
  console.log(JSON.stringify(record));
}

await page.waitForTimeout(3000);
await browser.close();
console.log(JSON.stringify({ ok: true, probes: results.length, submit_performed: false }));
