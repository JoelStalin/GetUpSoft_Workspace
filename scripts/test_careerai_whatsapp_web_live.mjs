// Prueba REAL (no mock) del WhatsAppWebProvider end-to-end: reconecta a la sesion ya
// persistida (sin QR, ya logueada) y envia un mensaje de verdad usando prepareWebMessage +
// sendWebMessage a traves de la interfaz comun. Verifica el envio leyendo el DOM del chat
// despues de enviar (no solo confiando en el valor de retorno) para evitar falsos positivos
// como el que se vio antes con un numero de prueba ambiguo.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
import { prepareWebMessage, sendWebMessage, sessionStatus } from '../apps/orca/src/careerai/whatsapp-web-provider.mjs';

function loadLocalEnv() {
  if (!fs.existsSync('.env.local')) return;
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadLocalEnv();

// Numero de prueba configurable (nunca hardcodeado): WHATSAPP_TEST_NUMBER en .env.local o
// primer argumento del CLI. Normaliza a E.164 asumiendo NANP (+1) si llega sin prefijo de
// pais y con 10 digitos.
function normalizeTestNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

const recipient = normalizeTestNumber(process.argv[2] || process.env.WHATSAPP_TEST_NUMBER);
if (!recipient) throw new Error('Uso: node scripts/test_careerai_whatsapp_web_live.mjs [numero] (o define WHATSAPP_TEST_NUMBER en .env.local)');
console.log(JSON.stringify({ step: 'recipient_normalized', recipient }));

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
const marker = `CareerAI-test-${Date.now()}`;
const messageText = `Prueba real de CareerAI (WhatsAppWebProvider) [${marker}]: si ves esto, el envio funciona end-to-end.`;

const prepared = prepareWebMessage({
  opportunity, approval, recipientPhone: recipient,
  text: messageText,
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

// --- verificacion real: leer el DOM del chat despues de enviar, no solo confiar en el
// valor de retorno de sendWebMessage. Busca el marcador unico en el ultimo mensaje saliente.
await page.waitForTimeout(2500);
const lastOutgoingText = await page.evaluate(() => {
  const bubbles = Array.from(document.querySelectorAll('div[data-testid="msg-container"], div.message-out'));
  const last = bubbles[bubbles.length - 1];
  return last ? last.innerText : null;
}).catch(() => null);

const confirmedInDom = typeof lastOutgoingText === 'string' && lastOutgoingText.includes(marker);
await page.screenshot({ path: 'task-ledger/evidence/careerai/live-test/whatsapp-web-sent.png' }).catch(() => {});

console.log(JSON.stringify({
  step: 'verified',
  confirmed_in_dom: confirmedInDom,
  last_outgoing_text_preview: lastOutgoingText ? lastOutgoingText.slice(0, 200) : null,
  marker,
}));

await context.close();
