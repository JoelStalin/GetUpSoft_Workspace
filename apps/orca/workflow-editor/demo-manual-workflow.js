import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  
  // Intercept API calls to provide mock workflow data
  await page.route('**/api/n8n/workflows', route => {
    route.abort('blockedbyclient');
  });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Get node library items and canvas
  const triggerNodeItem = await page.locator('text=Trigger').first();
  const aiNodeItem = await page.locator('text=AI Prompt').first();
  const httpNodeItem = await page.locator('text=HTTP Request').first();
  
  const canvas = await page.locator('[role="application"]').first();
  
  if (!triggerNodeItem || !canvas) {
    console.log('Could not find elements');
    await page.screenshot({ path: 'evidence/debug-elements.png', fullPage: true });
    await browser.close();
    return;
  }
  
  // Function to drag node to canvas
  const dragNodeToCanvas = async (nodeItem, xPercent, yPercent) => {
    const canvasBounds = await canvas.boundingBox();
    if (!canvasBounds) return;
    
    const targetX = canvasBounds.x + (canvasBounds.width * xPercent);
    const targetY = canvasBounds.y + (canvasBounds.height * yPercent);
    
    const nodeBounds = await nodeItem.boundingBox();
    if (!nodeBounds) return;
    
    // Perform drag
    await page.mouse.move(nodeBounds.x + nodeBounds.width / 2, nodeBounds.y + nodeBounds.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(targetX, targetY);
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(600);
  };
  
  // Drag first node (Trigger)
  console.log('Dragging Trigger node...');
  await dragNodeToCanvas(triggerNodeItem, 0.3, 0.4);
  
  // Drag second node (AI Prompt)
  console.log('Dragging AI Prompt node...');
  await dragNodeToCanvas(aiNodeItem, 0.5, 0.4);
  
  // Drag third node (HTTP Request)
  console.log('Dragging HTTP Request node...');
  await dragNodeToCanvas(httpNodeItem, 0.7, 0.4);
  
  await page.waitForTimeout(800);
  
  // Count nodes on canvas
  const nodeCount = await page.locator('[class*="react-flow__node"]').count();
  console.log(`✓ Nodes on canvas: ${nodeCount}`);
  
  // Take final screenshot
  await page.screenshot({ path: 'evidence/manual-workflow-demo.png', fullPage: true });
  console.log('✓ Screenshot: Manual workflow demonstration');
  
  await browser.close();
})();
