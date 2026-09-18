import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Testing node creation...\n');
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Check initial nodes
    const initialNodes = await page.locator('.react-flow__node').count();
    console.log(`✓ Initial nodes: ${initialNodes}`);

    // Try clicking on a node in the palette
    const searchInput = await page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('trigger');
    await page.waitForTimeout(300);

    const firstNode = await page.locator('[class*="node-row"]').first();
    console.log(`✓ Search result found: ${await firstNode.isVisible()}`);

    // Try clicking to add node
    await firstNode.click();
    await page.waitForTimeout(500);

    const nodesAfterClick = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes after click: ${nodesAfterClick}`);

    if (nodesAfterClick > initialNodes) {
      console.log(`✅ Node was added successfully!`);
    } else {
      console.log(`❌ Node was NOT added`);
    }

    // Check console errors
    const logs = await page.evaluate(() => {
      return window.__logs || [];
    });
    console.log('\nChecking for errors...');
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });

    // Try dragging from palette to canvas
    console.log('\nTrying drag-drop method...');
    const nodeToDrag = await page.locator('[class*="node-row"]').first();
    const canvas = await page.locator('.react-flow__viewport').first();
    
    await nodeToDrag.dragTo(canvas);
    await page.waitForTimeout(500);

    const nodesAfterDrag = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes after drag: ${nodesAfterDrag}`);

    if (nodesAfterDrag > nodesAfterClick) {
      console.log(`✅ Drag-drop works!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
