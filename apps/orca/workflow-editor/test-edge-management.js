import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for app to load
  await page.waitForTimeout(3000);
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'evidence/phase7-01-initial-state.png' });
  console.log('Screenshot 1: Initial state');
  
  // Open the left sidebar if closed
  const sidebarButton = await page.$('button[title*="panel"]');
  if (sidebarButton) {
    await sidebarButton.click();
    await page.waitForTimeout(500);
  }
  
  // Drag a node from palette to canvas (simulate)
  const palette = await page.$('[class*="Node"]');
  if (palette) {
    // Get canvas bounds
    const canvas = await page.$('[style*="width: 100%"]');
    const canvasBounds = await canvas.boundingBox();
    
    if (canvasBounds) {
      // Drag from palette to canvas center
      await page.dragAndDrop('[class*="NodePalette"] > div > div:first-child', 
        { x: canvasBounds.x + canvasBounds.width / 2, y: canvasBounds.y + canvasBounds.height / 2 });
      await page.waitForTimeout(500);
    }
  }
  
  await page.screenshot({ path: 'evidence/phase7-02-after-node-drag.png' });
  console.log('Screenshot 2: After node drag');
  
  // Test edge connection - simulate by clicking and dragging between nodes
  // First, check if nodes exist
  const nodes = await page.locator('[class*="react-flow__node"]').count();
  console.log(`Found ${nodes} nodes on canvas`);
  
  if (nodes >= 1) {
    await page.screenshot({ path: 'evidence/phase7-03-nodes-visible.png' });
    console.log('Screenshot 3: Nodes visible on canvas');
  }
  
  await browser.close();
})();
