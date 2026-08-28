import { connectForSending } from '../apps/orca/src/careerai/whatsapp-web-browser.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const { context, page } = await connectForSending({});
await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' });

// Espera larga con sondeo: la carga off-screen tarda mas que on-screen (~15-20s segun la
// prueba anterior). Se sondea hasta 30s por la presencia de CUALQUIER cosa que parezca la
// caja de busqueda, con selectores amplios (no solo contenteditable).
let found = null;
for (let i = 1; i <= 15 && !found; i++) {
  await page.waitForTimeout(2000);
  const candidates = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('input, [contenteditable="true"], [role="textbox"], [aria-label]'));
    return all
      .filter((el) => /search/i.test(el.getAttribute('aria-label') || el.getAttribute('title') || el.placeholder || ''))
      .map((el) => ({
        tag: el.tagName, ariaLabel: el.getAttribute('aria-label'), role: el.getAttribute('role'),
        contentEditable: el.contentEditable, placeholder: el.placeholder || null, title: el.getAttribute('title'),
        visible: el.offsetParent !== null,
      }));
  });
  console.log(JSON.stringify({ poll: i, seconds: i * 2, candidatesFound: candidates.length }));
  if (candidates.length) found = candidates;
}

await page.screenshot({ path: `${OUT}/headless-search-4-final.png` }).catch(() => {});
console.log(JSON.stringify({ step: 'result', found }, null, 2));

await context.close();
