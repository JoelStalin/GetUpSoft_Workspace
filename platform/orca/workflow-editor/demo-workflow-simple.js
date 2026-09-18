import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Find elements
  const triggerNodeItem = await page.locator('text=Trigger').first();
  const canvas = await page.locator('[role="application"]').first();
  
  if (!triggerNodeItem || !canvas) {
    console.log('Elements not found');
    await browser.close();
    return;
  }
  
  // Get canvas bounds
  const canvasBounds = await canvas.boundingBox();
  const triggerBounds = await triggerNodeItem.boundingBox();
  
  if (!canvasBounds || !triggerBounds) {
    console.log('Could not get bounds');
    await browser.close();
    return;
  }
  
  console.log(`Canvas: ${canvasBounds.x}, ${canvasBounds.y}, ${canvasBounds.width}x${canvasBounds.height}`);
  console.log(`Trigger: ${triggerBounds.x}, ${triggerBounds.y}, ${triggerBounds.width}x${triggerBounds.height}`);
  
  // Drag trigger to center-left of canvas
  const sourceX = triggerBounds.x + triggerBounds.width / 2;
  const sourceY = triggerBounds.y + triggerBounds.height / 2;
  const targetX = canvasBounds.x + canvasBounds.width * 0.35;
  const targetY = canvasBounds.y + canvasBounds.height * 0.4;
  
  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();
  
  console.log('✓ Drag completed');
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'evidence/demo-one-node.png', fullPage: true });
  
  await browser.close();
})();
