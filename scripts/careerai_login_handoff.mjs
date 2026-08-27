// Gate `login`: abre las plataformas con perfil persistente y CEDE el control al usuario.
// El agente nunca escribe credenciales; solo detecta cuando la sesion queda activa.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const profileDir = path.resolve('apps/orca/chrome_profile/careerai');
fs.mkdirSync(profileDir, { recursive: true });

const platforms = [
  { id: 'linkedin', login: 'https://www.linkedin.com/login', check: 'https://www.linkedin.com/feed/', signal: (url, text) => !/\/login|\/authwall|\/checkpoint/.test(url) && /Start a post|Inicio|Mis publicaciones|Feed/i.test(text) },
  { id: 'indeed', login: 'https://secure.indeed.com/account/login', check: 'https://myjobs.indeed.com/saved', signal: (url, text) => !/\/account\/login/.test(url) && /Saved|Guardados|My jobs/i.test(text) },
];

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: null,
  args: ['--start-maximized'],
});

const pages = [];
for (const platform of platforms) {
  const page = context.pages().length && !pages.length ? context.pages()[0] : await context.newPage();
  await page.goto(platform.login, { waitUntil: 'domcontentloaded' }).catch(() => {});
  pages.push({ platform, page });
}

console.log(JSON.stringify({ step: 'login_handoff', status: 'waiting_for_user', platforms: platforms.map((p) => p.id), instruction: 'Inicia sesion manualmente en las pestanas abiertas. El agente NO escribe credenciales.' }));

// Espera hasta 8 minutos a que el usuario inicie sesion, revisando cada 15 s.
const deadline = Date.now() + 8 * 60 * 1000;
const state = {};
while (Date.now() < deadline && Object.keys(state).length < platforms.length) {
  await new Promise((r) => setTimeout(r, 15000));
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
