// Gate `login` para WhatsApp Web: abre web.whatsapp.com con perfil persistente propio y
// CEDE el control al usuario para que escanee el codigo QR. El agente nunca ve ni escribe
// credenciales; solo detecta cuando la sesion queda activa. Mismo patron que
// careerai_login_handoff.mjs (LinkedIn/Indeed), perfil SEPARADO para no mezclar sesiones.
//
// *** Ver docs/whatsapp.md antes de usar este script. *** Automatizar WhatsApp Web viola
// los Terminos de Servicio de WhatsApp: riesgo real de que el numero vinculado quede
// baneado. Usa un numero SECUNDARIO, nunca tu numero personal.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
// Perfil dedicado a WhatsApp: separado de chrome_profile/careerai-migrated (Indeed/LinkedIn)
// a proposito. Mezclar sesiones en el mismo perfil de navegador no tiene ninguna ventaja y
// aumenta la superficie de lo que se pierde si un sitio detecta el otro.
const profileDir = path.resolve(process.env.WHATSAPP_WEB_PROFILE_DIR || 'apps/orca/chrome_profile/whatsapp-web');
fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: null,
  args: ['--start-maximized'],
});
const page = context.pages().length ? context.pages()[0] : await context.newPage();
await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' }).catch(() => {});

console.log(JSON.stringify({
  step: 'whatsapp_login_handoff',
  status: 'waiting_for_user',
  instruction: 'Escanea el codigo QR con WhatsApp en tu telefono (usa un numero SECUNDARIO, no tu numero personal). El agente NO escribe credenciales.',
  profile_dir: profileDir,
}));

// Espera hasta 5 minutos a que el QR sea escaneado (la lista de chats reemplaza al canvas del QR).
const deadline = Date.now() + 5 * 60 * 1000;
let loggedIn = false;
while (Date.now() < deadline && !loggedIn) {
  await new Promise((r) => setTimeout(r, 3000));
  try {
    const qrVisible = await page.locator('canvas[aria-label], div[data-testid="qrcode"]').first().isVisible().catch(() => false);
    const chatListVisible = await page.locator('div[aria-label="Chat list"], div[data-testid="chat-list"]').first().isVisible().catch(() => false);
    if (chatListVisible && !qrVisible) {
      loggedIn = true;
      await page.screenshot({ path: `${OUT}/whatsapp-web-session.png` }).catch(() => {});
      console.log(JSON.stringify({ step: 'session_detected', platform: 'whatsapp_web' }));
    }
  } catch { /* la pagina puede estar navegando */ }
}

const result = {
  ok: true,
  step: 'whatsapp_login_handoff_complete',
  logged_in: loggedIn,
  detected_at: loggedIn ? new Date().toISOString() : null,
  profile_dir: profileDir,
  credentials_written_by_agent: false,
  submit_performed: false,
};
fs.writeFileSync(`${OUT}/whatsapp-login-handoff.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await context.close();
