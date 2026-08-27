// Prepare-only real: abre una oferta real, localiza el formulario de postulacion y
// enumera los campos que el agente rellenaria. NO escribe credenciales, NO envia.
import fs from 'node:fs';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const PAUSE_ON = ['login', 'consent', 'captcha', 'mfa', 'file_upload', 'submit', 'unknown_domain'];

const browser = await chromium.launch({ headless: false, slowMo: 400, args: ['--start-maximized'] });
const page = await (await browser.newContext({ viewport: null })).newPage();

// 1. Discovery real
await page.goto('https://weworkremotely.com/remote-jobs/search?term=software+engineer', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
// Solo ofertas reales: las URLs de listado tienen la forma /remote-jobs/<slug> y hay
// que excluir rutas de navegacion (find-your-plan, search, categories, companies...).
const opportunities = await page.evaluate(() => {
  const EXCLUDE = /find-your-plan|\/search|categories|companies|100-percent|region|top-/i;
  return Array.from(document.querySelectorAll('a[href*="/remote-jobs/"]'))
    .map((a) => ({ title: a.innerText.trim().split(String.fromCharCode(10)).filter(Boolean).slice(0, 2).join(' - '), url: a.href.split('?')[0] }))
    .filter((o) => o.title && !EXCLUDE.test(o.url) && /\/remote-jobs\/[a-z0-9-]{12,}$/i.test(o.url))
    .filter((o, i, all) => all.findIndex((x) => x.url === o.url) === i)
    .slice(0, 5);
});
console.log(JSON.stringify({ step: 'discovery', found: opportunities.length, sample: opportunities.slice(0, 3) }));
if (!opportunities.length) { await browser.close(); throw new Error('No opportunities discovered'); }

// 2. Abrir una oportunidad real
const opportunity = opportunities[0];
await page.goto(opportunity.url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/opportunity.png` });

// 3. Seguir el enlace de postulacion (puede salir a un ATS externo)
const applyHref = await page.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a')).find((a) => /apply/i.test(a.innerText) || /apply/i.test(a.href));
  return link ? link.href : null;
});
const record = { step: 'apply_form', opportunity, apply_url: applyHref, submit_performed: false };

if (applyHref) {
  await page.goto(applyHref, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => { record.nav_error = String(e).split('\n')[0]; });
  await page.waitForTimeout(4000);
  record.landed_on = page.url();
  record.host = new URL(page.url()).host;
  // 4. Auditoria del formulario: que campos existen (sin escribir nada)
  record.fields = await page.evaluate(() => Array.from(document.querySelectorAll('input, textarea, select'))
    .filter((el) => !['hidden'].includes(el.type))
    .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.type || null, name: el.name || el.id || null, required: el.required || false }))
    .slice(0, 40));
  const text = await page.evaluate(() => document.body.innerText);
  record.gates_detected = PAUSE_ON.filter((gate) => new RegExp(gate.replace('_', '.?'), 'i').test(text));
  record.file_upload_present = record.fields.some((f) => f.type === 'file');
  await page.screenshot({ path: `${OUT}/apply-form.png`, fullPage: false });
  record.screenshot = `${OUT}/apply-form.png`;
}

// 5. GATE: aqui se detiene. El submit exige sesion del usuario y aprobacion explicita.
record.stopped_at = 'human_approval_required';
record.reason = 'submit deshabilitado por diseno; requiere login del usuario y aprobacion por oportunidad';
console.log(JSON.stringify(record));
fs.writeFileSync(`${OUT}/apply-probe.json`, JSON.stringify(record, null, 2));
await page.waitForTimeout(4000);
await browser.close();
