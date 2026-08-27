// Verifica las sesiones del perfil migrado y, si falta alguna, CEDE el control al
// usuario para que inicie sesion. La sesion queda guardada en el perfil persistente,
// asi que las corridas siguientes ya no la piden. El agente nunca escribe credenciales.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const PROFILE_DIR = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const WAIT_MINUTES = Number(process.env.CAREERAI_LOGIN_WAIT_MINUTES || 6);
fs.mkdirSync(OUT, { recursive: true });

const PLATFORMS = [
  { id: 'linkedin', check: 'https://www.linkedin.com/feed/', login: 'https://www.linkedin.com/login',
    loggedIn: (u, t) => !/\/login|\/authwall|\/checkpoint|\/uas\//.test(u) && /Start a post|Empieza una publicación|Comenzar una publicación/i.test(t) },
  { id: 'indeed', check: 'https://myjobs.indeed.com/saved', login: 'https://secure.indeed.com/account/login',
    loggedIn: (u, t) => !/\/account\/login|\/auth/.test(u) && /Saved jobs|Empleos guardados|My jobs|Mis empleos/i.test(t) },
];

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  channel: 'chrome', headless: false, viewport: null, args: ['--start-maximized'],
});
const page = context.pages()[0] || await context.newPage();

async function probe(platform) {
  await page.goto(platform.check, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  return { logged_in: platform.loggedIn(page.url(), text), url: page.url() };
}

const state = {};
const pending = [];
for (const platform of PLATFORMS) {
  state[platform.id] = await probe(platform);
  console.log(JSON.stringify({ step: 'session_check', platform: platform.id, ...state[platform.id] }));
  if (!state[platform.id].logged_in) pending.push(platform);
  else await page.screenshot({ path: `${OUT}/vault-${platform.id}.png` }).catch(() => {});
}

// Gate `login`: el usuario inicia sesion a mano; el perfil persistente la conserva.
if (pending.length) {
  console.log(JSON.stringify({ step: 'login_required', platforms: pending.map((p) => p.id),
    instruction: 'Inicia sesion en la ventana abierta. Se guardara en el perfil para las proximas corridas.' }));
  for (const platform of pending) {
    await page.goto(platform.login, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const deadline = Date.now() + WAIT_MINUTES * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 10000));
      const result = await probe(platform);
      if (result.logged_in) {
        state[platform.id] = { ...result, logged_in_via: 'user_handoff' };
        await page.screenshot({ path: `${OUT}/vault-${platform.id}.png` }).catch(() => {});
        console.log(JSON.stringify({ step: 'session_saved', platform: platform.id }));
        break;
      }
      await page.goto(platform.login, { waitUntil: 'domcontentloaded' }).catch(() => {});
    }
  }
}

const report = { ok: true, profile_dir: PROFILE_DIR, sessions: state,
  credentials_written_by_agent: false, submit_performed: false };
fs.writeFileSync(`${OUT}/session-vault.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await context.close();
