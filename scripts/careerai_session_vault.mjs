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

// La sonda corre SIEMPRE en una pestana aparte: si usara la pestana del usuario le
// borraria lo que esta escribiendo cada vez que revisa el estado de la sesion.
async function probe(platform, target = page) {
  await target.goto(platform.check, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await target.waitForTimeout(4000);
  const text = await target.evaluate(() => document.body.innerText).catch(() => '');
  return { logged_in: platform.loggedIn(target.url(), text), url: target.url() };
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
  // Cada plataforma pendiente recibe su propia pestana, que queda intacta para el
  // usuario. Una pestana oculta aparte se encarga de comprobar el estado.
  const tabs = [];
  for (const platform of pending) {
    const tab = tabs.length === 0 ? page : await context.newPage();
    await tab.goto(platform.login, { waitUntil: 'domcontentloaded' }).catch(() => {});
    tabs.push({ platform, tab });
  }
  const monitor = await context.newPage();
  const deadline = Date.now() + WAIT_MINUTES * 60 * 1000;
  const done = new Set();
  while (Date.now() < deadline && done.size < pending.length) {
    await new Promise((r) => setTimeout(r, 15000));
    for (const { platform } of tabs) {
      if (done.has(platform.id)) continue;
      const result = await probe(platform, monitor);
      if (result.logged_in) {
        done.add(platform.id);
        state[platform.id] = { ...result, logged_in_via: 'user_handoff' };
        await monitor.screenshot({ path: `${OUT}/vault-${platform.id}.png` }).catch(() => {});
        console.log(JSON.stringify({ step: 'session_saved', platform: platform.id }));
      }
    }
  }
  await monitor.close().catch(() => {});
  const missing = pending.filter((p) => !done.has(p.id)).map((p) => p.id);
  if (missing.length) console.log(JSON.stringify({ step: 'login_timeout', missing, hint: `Vuelve a ejecutar con CAREERAI_LOGIN_WAIT_MINUTES mayor que ${WAIT_MINUTES}` }));
}

const report = { ok: true, profile_dir: PROFILE_DIR, sessions: state,
  credentials_written_by_agent: false, submit_performed: false };
fs.writeFileSync(`${OUT}/session-vault.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await context.close();
