import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Take screenshot with new layout
  await page.screenshot({ path: 'evidence/layout-fixed-with-sidebar.png', fullPage: true });
  console.log('Screenshot: Nuevo layout con sidebar abierto');
  
  // Click sidebar toggle to close it
  const toggleBtn = await page.locator('button').first();
  await toggleBtn.click();
  await page.waitForTimeout(500);
  
  // Take screenshot with sidebar closed
  await page.screenshot({ path: 'evidence/layout-fixed-sidebar-closed.png', fullPage: true });
  console.log('Screenshot: Sidebar cerrado - canvas visible');
  
  await browser.close();
})();
