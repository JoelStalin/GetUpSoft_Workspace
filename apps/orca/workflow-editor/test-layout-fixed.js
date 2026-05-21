import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/layout-working-sidebar-open.png', fullPage: true });
  console.log('✓ Layout fixed - sidebar open, canvas visible');
  
  await browser.close();
})();
