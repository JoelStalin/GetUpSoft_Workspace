// Gate `login`: abre las plataformas con perfil persistente y CEDE el control al usuario.
// El agente nunca escribe credenciales; solo detecta cuando la sesion queda activa.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
// Mismo perfil que leen careerai_session_vault.mjs y careerai_harvest.mjs (chrome_profile/
// careerai-migrated). Antes apuntaba a chrome_profile/careerai, un perfil distinto: un login
// hecho con este script no lo habria visto el resto del pipeline.
const profileDir = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
fs.mkdirSync(profileDir, { recursive: true });

const platforms = [
  { id: 'linkedin', login: 'https://www.linkedin.com/login', check: 'https://www.linkedin.com/feed/', signal: (url, text) => !/\/login|\/authwall|\/checkpoint/.test(url) && /Start a post|Inicio|Mis publicaciones|Feed/i.test(text) },
  { id: 'indeed', login: 'https://secure.indeed.com/account/login', check: 'https://myjobs.indeed.com/saved', signal: (url, text) => !/\/account\/login/.test(url) && /Saved|Guardados|My jobs/i.test(text) },
];

// Mismo fix que se aplico a WhatsApp Web (2026-08-28, diagnosticado con
// scripts/diagnose_whatsapp_web_qr.mjs): Chrome real + UA fijo + viewport grande +
// anti-deteccion, en vez del Chromium empaquetado de Playwright con viewport null. LinkedIn
// tambien es agresivo detectando automatizacion en su pantalla de login.
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

const pages = [];
for (const platform of platforms) {
  const page = context.pages().length && !pages.length ? context.pages()[0] : await context.newPage();
  await page.goto(platform.login, { waitUntil: 'domcontentloaded' }).catch(() => {});
  pages.push({ platform, page });
}
await pages[0]?.page.bringToFront().catch(() => {});

console.log(JSON.stringify({ step: 'login_handoff', status: 'waiting_for_user', platforms: platforms.map((p) => p.id), instruction: 'Inicia sesion manualmente en las pestanas abiertas. El agente NO escribe credenciales. Esta ventana no se cierra sola: queda abierta hasta que ambas sesiones queden activas.' }));

// La ventana NO se cierra por timeout (mismo criterio que WhatsApp Web): sondea
// indefinidamente cada 15s hasta que las dos plataformas queden logueadas, o hasta que el
// proceso se mate externamente. Sin deadline, sin browser.close() en ningun camino de espera.
const state = {};
let pollCount = 0;
while (Object.keys(state).length < platforms.length) {
  await new Promise((r) => setTimeout(r, 15000));
  pollCount += 1;
  for (const { platform, page } of pages) {
    if (state[platform.id]) continue;
    try {
      const url = page.url();
      const text = await page.evaluate(() => document.body.innerText).catch(() => '');
      if (platform.signal(url, text)) {
        state[platform.id] = { logged_in: true, detected_at: new Date().toISOString(), url };
        await page.screenshot({ path: `${OUT}/session-${platform.id}.png` }).catch(() => {});
        console.log(JSON.stringify({ step: 'session_detected', platform: platform.id }));
      }
    } catch { /* pestana navegando */ }
  }
  if (pollCount % 4 === 0 && Object.keys(state).length < platforms.length) {
    console.log(JSON.stringify({
      step: 'login_handoff', status: 'still_waiting_for_user',
      pending: platforms.map((p) => p.id).filter((id) => !state[id]),
      minutes_elapsed: Math.round((pollCount * 15) / 60),
    }));
  }
}

const result = {
  ok: true,
  step: 'login_handoff_complete',
  sessions: Object.fromEntries(platforms.map((p) => [p.id, state[p.id] || { logged_in: false }])),
  profile_dir: profileDir,
  credentials_written_by_agent: false,
  submit_performed: false,
};
fs.writeFileSync(`${OUT}/login-handoff.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await context.close();
