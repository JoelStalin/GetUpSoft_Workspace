import { connectForSending } from '../apps/orca/src/careerai/whatsapp-web-browser.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const recipient = (process.argv[2] || '+18492600983').replace(/^\+/, '');
const { context, page } = await connectForSending({});
await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' });

const searchBox = page.locator('input[aria-label*="Search" i]').first();
await searchBox.waitFor({ state: 'visible', timeout: 30000 });
await searchBox.click();
await searchBox.type(recipient, { delay: 30 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/composer-diag-1-search.png` }).catch(() => {});

const resultsInfo = await page.evaluate(() => {
  const region = document.querySelector('div[aria-label="Search results."]') || document.body;
  return Array.from(region.querySelectorAll('[role="listitem"], span[title], div[role="gridcell"]')).slice(0, 10).map((el) => ({
    tag: el.tagName, role: el.getAttribute('role'), title: el.getAttribute('title'), text: el.innerText?.slice(0, 60),
  }));
});
console.log(JSON.stringify({ step: 'search_results', resultsInfo }, null, 2));

await page.locator('div[aria-label="Search results."] div[role="listitem"], span[title]').first().click({ timeout: 15000 }).catch((e) => console.log(JSON.stringify({ step: 'click_result_error', text: String(e?.message || e) })));
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/composer-diag-2-afterclick.png` }).catch(() => {});

const mainInfo = await page.evaluate(() => {
  const main = document.querySelector('#main');
  if (!main) return { mainExists: false };
  const editableLike = Array.from(main.querySelectorAll('[contenteditable], [role="textbox"], footer *[aria-label]'))
    .map((el) => ({ tag: el.tagName, contentEditable: el.getAttribute('contenteditable'), role: el.getAttribute('role'), ariaLabel: el.getAttribute('aria-label'), dataTab: el.getAttribute('data-tab') }));
  return { mainExists: true, editableLike };
});
console.log(JSON.stringify({ step: 'main_panel', mainInfo }, null, 2));

await context.close();
