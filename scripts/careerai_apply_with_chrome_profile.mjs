// Prepare-only sobre el perfil REAL de Chrome del usuario (sesiones ya iniciadas).
// Requiere que Chrome este cerrado: el perfil esta bloqueado mientras Chrome corre.
// El agente NO escribe credenciales y NO envia formularios.
import fs from 'node:fs';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const USER_DATA_DIR = process.env.CHROME_USER_DATA_DIR
  || 'C:/Users/yoeli/AppData/Local/Google/Chrome/User Data';
const PROFILE = process.env.CHROME_PROFILE || 'Default';
const PAUSE_ON = ['login', 'consent', 'captcha', 'mfa', 'file_upload', 'submit', 'unknown_domain'];

fs.mkdirSync(OUT, { recursive: true });

const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
  channel: 'chrome',
  headless: false,
  viewport: null,
  args: [`--profile-directory=${PROFILE}`, '--start-maximized'],
});

const page = context.pages()[0] || await context.newPage();
const report = { profile: `${USER_DATA_DIR}/${PROFILE}`, sessions: {}, opportunities: [], submit_performed: false };

// 1. Verificar que las sesiones del perfil real estan activas
const checks = [
  { id: 'linkedin', url: 'https://www.linkedin.com/feed/', loggedIn: (u, t) => !/\/login|\/authwall|\/checkpoint/.test(u) && /Start a post|Empieza una publicación|Feed/i.test(t) },
  { id: 'indeed', url: 'https://myjobs.indeed.com/saved', loggedIn: (u, t) => !/\/account\/login/.test(u) && /Saved|Guardados|My jobs|Mis empleos/i.test(t) },
];
for (const check of checks) {
  await page.goto(check.url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  report.sessions[check.id] = { logged_in: check.loggedIn(page.url(), text), url: page.url() };
  await page.screenshot({ path: `${OUT}/profile-${check.id}.png` }).catch(() => {});
  console.log(JSON.stringify({ step: 'session_check', platform: check.id, ...report.sessions[check.id] }));
}

// 2. Discovery real en LinkedIn Jobs con la sesion del usuario
await page.goto('https://www.linkedin.com/jobs/search/?keywords=software%20engineer&f_AL=true', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(5000);
report.opportunities = await page.evaluate(() => Array.from(document.querySelectorAll('a[href*="/jobs/view/"]'))
  .map((a) => ({ title: a.innerText.trim().split(String.fromCharCode(10))[0], url: a.href.split('?')[0] }))
  .filter((o) => o.title)
  .filter((o, i, all) => all.findIndex((x) => x.url === o.url) === i)
  .slice(0, 5));
await page.screenshot({ path: `${OUT}/profile-jobs.png` }).catch(() => {});
console.log(JSON.stringify({ step: 'discovery', found: report.opportunities.length, sample: report.opportunities.slice(0, 3) }));

// 3. Abrir una oferta y auditar el formulario de Easy Apply SIN rellenar ni enviar
if (report.opportunities.length) {
  const opportunity = report.opportunities[0];
  await page.goto(opportunity.url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const applyButton = page.locator('button:has-text("Easy Apply"), button:has-text("Solicitud sencilla")').first();
  const hasEasyApply = await applyButton.count() > 0;
  report.easy_apply_available = hasEasyApply;
  if (hasEasyApply) {
    await applyButton.click().catch(() => {});
    await page.waitForTimeout(4000);
    report.form_fields = await page.evaluate(() => Array.from(document.querySelectorAll('.jobs-easy-apply-content input, .jobs-easy-apply-content select, .jobs-easy-apply-content textarea, [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea'))
      .filter((el) => el.type !== 'hidden')
      .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.type || null, label: (el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 80), required: el.required || false })));
    report.file_upload_present = (report.form_fields || []).some((f) => f.type === 'file');
  }
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  report.gates_detected = PAUSE_ON.filter((gate) => new RegExp(gate.replace('_', '.?'), 'i').test(text));
  report.opportunity_opened = opportunity;
  await page.screenshot({ path: `${OUT}/profile-apply-form.png` }).catch(() => {});
}

// 4. GATE: nunca se pulsa Submit/Enviar solicitud.
report.stopped_at = 'human_approval_required';
report.reason = 'formulario preparado y visible; el envio exige aprobacion explicita por oportunidad';
fs.writeFileSync(`${OUT}/chrome-profile-apply.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await page.waitForTimeout(5000);
await context.close();
