import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/white-canvas-with-nodes.png' });
  console.log('✓ Screenshot: White canvas');
  
  await browser.close();
})();
