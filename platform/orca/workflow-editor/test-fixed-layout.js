import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Check canvas bounds
  const canvas = await page.locator('[role="application"]').first();
  const canvasBounds = await canvas.boundingBox();
  console.log(`Canvas: x=${canvasBounds?.x}, y=${canvasBounds?.y}, w=${canvasBounds?.width}, h=${canvasBounds?.height}`);
  
  // Check node count
  const nodeCount = await page.locator('[class*="react-flow__node"]').count();
  console.log(`✓ Nodes visible: ${nodeCount}`);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/final-layout-with-nodes.png' });
  console.log('✓ Screenshot taken');
  
  await browser.close();
})();
