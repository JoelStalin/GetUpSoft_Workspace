// Script de diagnostico, NO de produccion: abre WhatsApp Web con instrumentacion completa
// (consola, red, screenshot) para ver por que el QR no renderiza, en vez de adivinar.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
fs.mkdirSync(OUT, { recursive: true });
// Perfil de diagnostico FRESCO por defecto (no el de produccion): aisla si el problema es
// el perfil (a medio inicializar por los intentos previos con el Chromium empaquetado) o
// algo mas general (deteccion de automatizacion, UA, viewport). Pasar
// WHATSAPP_WEB_PROFILE_DIR=apps/orca/chrome_profile/whatsapp-web para probar contra el
// perfil real una vez descartado que sea un problema de perfil.
const profileDir = path.resolve(process.env.WHATSAPP_WEB_PROFILE_DIR || 'apps/orca/chrome_profile/whatsapp-web-diagnose');
fs.mkdirSync(profileDir, { recursive: true });

const consoleLog = [];
const networkLog = [];

const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chrome', // Chrome real instalado, no el Chromium empaquetado de Playwright
  headless: false,
  viewport: { width: 1366, height: 900 }, // WhatsApp Web esconde el QR bajo cierto ancho
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  args: [
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
  ],
});

const page = context.pages().length ? context.pages()[0] : await context.newPage();

// navigator.webdriver es la señal mas obvia de automatizacion; Playwright lo deja en true
// por defecto en Chromium/Chrome. Se sobreescribe antes de que cargue cualquier script del
// sitio.
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

page.on('console', (msg) => consoleLog.push({ type: msg.type(), text: msg.text() }));
page.on('requestfailed', (req) => networkLog.push({ url: req.url(), failure: req.failure()?.errorText || null }));
page.on('response', (res) => {
  if (!res.ok()) networkLog.push({ url: res.url(), status: res.status() });
});

console.log(JSON.stringify({ step: 'navigating' }));
await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => {
  consoleLog.push({ type: 'goto_error', text: String(e?.message || e) });
});

// Espera activa al selector real del QR (no un timeout fijo ciego), con reintentos cortos
// para dar tiempo a que la app de WhatsApp termine de montar.
let qrFound = false;
let qrSelector = null;
const candidates = [
  'canvas[aria-label*="Scan"]',
  'canvas[aria-label*="scan"]',
  'div[data-testid="qrcode"]',
  'div[data-ref] canvas',
];
for (let i = 0; i < 10 && !qrFound; i++) {
  for (const sel of candidates) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false);
    if (visible) { qrFound = true; qrSelector = sel; break; }
  }
  if (!qrFound) await page.waitForTimeout(1500);
}

const navigatorWebdriver = await page.evaluate(() => navigator.webdriver).catch(() => 'eval_failed');
const userAgent = await page.evaluate(() => navigator.userAgent).catch(() => 'eval_failed');
const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => 'eval_failed');
const title = await page.title().catch(() => 'eval_failed');

const screenshotPath = path.resolve(OUT, 'whatsapp-web-diagnose.png');
await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

const report = {
  ok: true,
  qr_found: qrFound,
  qr_selector: qrSelector,
  navigator_webdriver: navigatorWebdriver,
  user_agent: userAgent,
  page_title: title,
  body_text_preview: bodyText,
  console_log_tail: consoleLog.slice(-30),
  network_errors: networkLog.slice(-30),
  screenshot_path: screenshotPath,
  profile_dir: profileDir,
};
fs.writeFileSync(path.resolve(OUT, 'whatsapp-web-diagnose.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await context.close();
