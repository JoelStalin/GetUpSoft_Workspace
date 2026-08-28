// Prueba REAL (no mock) del WhatsAppWebProvider end-to-end: reconecta a la sesion ya
// persistida (sin QR, ya logueada) y envia un mensaje de verdad usando prepareWebMessage +
// sendWebMessage a traves de la interfaz comun. Numero de prueba: el propio del operador,
// para no escribirle a nadie mas sin opt-in real.
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
import { prepareWebMessage, sendWebMessage, sessionStatus } from '../apps/orca/src/careerai/whatsapp-web-provider.mjs';

const recipient = process.argv[2];
if (!recipient) throw new Error('Uso: node scripts/test_careerai_whatsapp_web_live.mjs <numero_E164>');

const profileDir = path.resolve(process.env.WHATSAPP_WEB_PROFILE_DIR || 'apps/orca/chrome_profile/whatsapp-web');

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
await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// Cierra el dialogo "What's new" u otros modales de bienvenida si aparecen, para que no
// bloqueen el cuadro de escritura.
await page.locator('div[role="dialog"] button:has-text("Continue"), div[role="dialog"] [aria-label="Close"]').first().click({ timeout: 3000 }).catch(() => {});

const status = await sessionStatus({
  readSessionFile: async () => ({ logged_in: true, detected_at: new Date().toISOString() }),
});
console.log(JSON.stringify({ step: 'status', ...status }));

const opportunity = { opportunity_id: 'live-smoke-web' };
const approval = {
  approval_id: 'live-smoke-web-approval',
  opportunity_id: 'live-smoke-web',
  status: 'approved',
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  payload_hash: null,
};
const optedInPhones = new Set([recipient.replace(/[^\d+]/g, '')]);

const prepared = prepareWebMessage({
  opportunity, approval, recipientPhone: recipient,
  text: 'Prueba real de CareerAI (WhatsAppWebProvider): si ves esto, el envio via WhatsApp Web automatizado funciona end-to-end.',
  optedInPhones,
});
console.log(JSON.stringify({ step: 'prepared', ...prepared }));

if (prepared.status !== 'ready_to_send') {
  console.log(JSON.stringify({ step: 'stopped', reason: 'no quedo listo para enviar, ver arriba' }));
  await context.close();
  process.exit(0);
}

const sent = await sendWebMessage(prepared, { confirm: true, page, jitterMs: 500 });
console.log(JSON.stringify({ step: 'sent', ...sent }));

await page.screenshot({ path: 'task-ledger/evidence/careerai/live-test/whatsapp-web-sent.png' }).catch(() => {});
await context.close();
