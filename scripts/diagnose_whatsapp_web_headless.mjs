// Diagnostico: por que el envio headless no aparece confirmado en el DOM aunque
// sendWebMessage no lanzo error. Instrumenta con screenshot + consola + estado del input en
// cada paso, en headless real (no visible), para ver que pasa de verdad.
import { connectForSending } from '../platform/orca/src/careerai/whatsapp-web-browser.mjs';

const recipient = process.argv[2] || '+18492600983';
const OUT = 'task-ledger/evidence/careerai/live-test';

const { context, page } = await connectForSending({});
console.log(JSON.stringify({ step: 'connected', headless: true }));

const consoleLog = [];
page.on('console', (msg) => consoleLog.push({ type: msg.type(), text: msg.text().slice(0, 200) }));

await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/headless-diag-1-home.png` }).catch(() => {});

const deepLinkUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(recipient.replace(/[^\d+]/g, ''))}`;
await page.goto(deepLinkUrl, { waitUntil: 'domcontentloaded' }).catch((e) => consoleLog.push({ type: 'goto_error', text: String(e?.message || e) }));
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/headless-diag-2-afterdeeplink.png` }).catch(() => {});

const inputSelector = 'div[contenteditable="true"][data-tab="10"]';
const inputExistsNow = await page.locator(inputSelector).count();
const bodyPreview = await page.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => 'eval_failed');

let waitError = null;
try {
  await page.waitForSelector(inputSelector, { timeout: 15000 });
} catch (e) {
  waitError = String(e?.message || e);
}
await page.screenshot({ path: `${OUT}/headless-diag-3-afterwait.png` }).catch(() => {});

const report = {
  ok: true,
  deep_link_url: deepLinkUrl,
  final_url: page.url(),
  input_selector: inputSelector,
  input_count_before_wait: inputExistsNow,
  wait_for_selector_error: waitError,
  body_text_preview: bodyPreview,
  console_log_tail: consoleLog.slice(-20),
};
console.log(JSON.stringify(report, null, 2));
await context.close();
