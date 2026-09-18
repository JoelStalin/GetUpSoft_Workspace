import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://127.0.0.1:4173/?workflow=careerai-indeed-agent', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
const text = await page.evaluate(() => document.body.innerText);
await page.screenshot({ path: 'task-ledger/evidence/careerai/canvas-live-browser.png', fullPage: false });
await browser.close();
const result = {
  ok: true,
  live_browser_visible: /Live browser monitor/i.test(text),
  form_fill_visible: /External job form fill/i.test(text),
  page_errors: errors.slice(0, 3),
  screenshot: 'task-ledger/evidence/careerai/canvas-live-browser.png',
};
if (!result.live_browser_visible) throw new Error('Live browser monitor node not rendered in ORCA canvas');
if (!result.form_fill_visible) throw new Error('External form fill node not rendered in ORCA canvas');
if (result.page_errors.length) throw new Error(`Canvas page errors: ${result.page_errors.join(' | ')}`);
console.log(JSON.stringify(result));
