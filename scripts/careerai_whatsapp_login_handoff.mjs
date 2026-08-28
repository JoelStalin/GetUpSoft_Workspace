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
// aumenta la superficie de lo que se pierde si un sitio detecta el otro. Es el MISMO
// directorio que lee whatsapp-web-provider.mjs via sessionStatus/readSessionFile — no hay
// dos rutas de perfil distintas para WhatsApp (el bug que si hubo entre
// careerai_login_handoff.mjs y careerai_session_vault.mjs para LinkedIn/Indeed).
const profileDir = path.resolve(process.env.WHATSAPP_WEB_PROFILE_DIR || 'apps/orca/chrome_profile/whatsapp-web');
const minutesPerAttempt = Number(process.env.WHATSAPP_LOGIN_TIMEOUT_MINUTES || 12);
const maxAttempts = Number(process.env.WHATSAPP_LOGIN_MAX_ATTEMPTS || 3);
fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// Diagnosticado 2026-08-28 (scripts/diagnose_whatsapp_web_qr.mjs, con screenshot y logs de
// consola/red reales, no adivinado): el Chromium empaquetado de Playwright, con viewport
// null y sin fijar UA, se quedaba atascado en la pantalla de carga — el QR nunca renderizaba.
// Causa mas probable: deteccion de automatizacion (navigator.webdriver) + UA por defecto de
// Chromium que WhatsApp Web no reconoce del todo. Fix confirmado con capturas reales:
//   - channel: 'chrome' -> usa el Chrome real instalado, no el binario de test de Playwright
//   - UA de Chrome actual fijado explicitamente
//   - viewport >= 1366x900 (WhatsApp Web esconde el QR bajo cierto ancho)
//   - --disable-blink-features=AutomationControlled + navigator.webdriver sobreescrito
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

function writeStatus(record) {
  fs.writeFileSync(`${OUT}/whatsapp-login-handoff.json`, JSON.stringify(record, null, 2));
  console.log(JSON.stringify(record));
}

let loggedIn = false;
let attempt = 0;

while (!loggedIn && attempt < maxAttempts) {
  attempt += 1;
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  // Trae la pestana y la ventana al frente: sin esto el QR puede quedar detras de otras
  // ventanas del escritorio y el usuario no lo ve.
  await page.bringToFront().catch(() => {});

  writeStatus({
    step: 'whatsapp_login_handoff',
    status: 'waiting_for_user',
    attempt,
    max_attempts: maxAttempts,
    timeout_minutes: minutesPerAttempt,
    instruction: 'Escanea el codigo QR con WhatsApp en tu telefono (usa un numero SECUNDARIO, no tu numero personal). El agente NO escribe credenciales.',
    profile_dir: profileDir,
  });

  const deadline = Date.now() + minutesPerAttempt * 60 * 1000;
  while (Date.now() < deadline && !loggedIn) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const qrVisible = await page.locator('canvas[aria-label*="Scan"], canvas[aria-label*="scan"], div[data-testid="qrcode"]').first().isVisible().catch(() => false);
      const chatListVisible = await page.locator('div[aria-label="Chat list"], div[data-testid="chat-list"]').first().isVisible().catch(() => false);
      if (chatListVisible && !qrVisible) {
        loggedIn = true;
        await page.screenshot({ path: `${OUT}/whatsapp-web-session.png` }).catch(() => {});
        writeStatus({
          step: 'session_detected', platform: 'whatsapp_web', attempt,
          detected_at: new Date().toISOString(), profile_dir: profileDir,
        });
      }
    } catch { /* la pagina puede estar navegando */ }
  }

  if (!loggedIn) {
    writeStatus({
      step: 'whatsapp_login_handoff_attempt_expired',
      status: 'expired', attempt, max_attempts: maxAttempts,
      will_retry: attempt < maxAttempts,
      profile_dir: profileDir,
    });
  }
}

const result = {
  ok: true,
  step: 'whatsapp_login_handoff_complete',
  logged_in: loggedIn,
  attempts_used: attempt,
  detected_at: loggedIn ? new Date().toISOString() : null,
  profile_dir: profileDir,
  credentials_written_by_agent: false,
  submit_performed: false,
};
writeStatus(result);
await context.close();
