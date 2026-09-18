import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Screenshot
  await page.screenshot({ path: 'evidence/canvas-with-background.png' });
  console.log('✓ Canvas screenshot taken');
  
  // Check if nodes are visible
  const nodeCount = await page.locator('[class*="react-flow__node"]').count();
  console.log(`✓ Nodes in DOM: ${nodeCount}`);
  
  // Get canvas HTML
  const canvasHTML = await page.locator('[role="application"]').first().innerHTML();
  if (canvasHTML.includes('Trigger')) {
    console.log('✓ "Trigger" text found in canvas');
  }
  if (canvasHTML.includes('HTTP') || canvasHTML.includes('Request')) {
    console.log('✓ HTTP node content found');
  }
  
  await browser.close();
})();
