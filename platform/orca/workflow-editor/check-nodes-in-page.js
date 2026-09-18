import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Get page content
  const content = await page.content();
  
  // Check for node elements
  if (content.includes('Trigger') && content.includes('HTTP Request') && content.includes('AI Prompt')) {
    console.log('✓ Node labels found in page HTML');
  }
  
  // Check for node library items
  const libraryItems = await page.locator('text=Trigger').count();
  console.log(`Library Trigger items: ${libraryItems}`);
  
  // Get canvas viewport
  const canvas = await page.locator('[role="application"]').first();
  const canvasBounds = await canvas.boundingBox();
  console.log(`Canvas bounds: x=${canvasBounds?.x}, y=${canvasBounds?.y}, w=${canvasBounds?.width}, h=${canvasBounds?.height}`);
  
  // Get viewport
  const viewportSize = page.viewportSize();
  console.log(`Viewport: ${viewportSize?.width}x${viewportSize?.height}`);
  
  // Try screenshot without fullPage
  await page.screenshot({ path: 'evidence/nodes-viewport-only.png' });
  console.log('✓ Screenshot taken (viewport only)');
  
  await browser.close();
})();
