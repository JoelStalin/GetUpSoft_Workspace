import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/with-fitview-enabled.png' });
  console.log('✓ Screenshot: With fitView enabled');
  
  await browser.close();
})();
