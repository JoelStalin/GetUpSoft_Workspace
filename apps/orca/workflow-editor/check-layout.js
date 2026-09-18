import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Take screenshot of actual layout
  await page.screenshot({ path: 'evidence/layout-actual.png', fullPage: true });
  console.log('Screenshot capturado');
  
  // Check elements
  const nodes = await page.locator('[class*="react-flow__node"]').count();
  const canvas = await page.locator('[class*="react-flow"]').count();
  const sidebar = await page.locator('[class*="translate-x"]').count();
  
  console.log('Nodos:', nodes);
  console.log('Canvas:', canvas);
  console.log('Sidebar:', sidebar);
  
  // Check CSS display
  const canvasElement = await page.locator('[style*="width: 100%"]').first();
  const display = await canvasElement.evaluate(el => window.getComputedStyle(el).display);
  console.log('Canvas display:', display);
  
  await browser.close();
})();
