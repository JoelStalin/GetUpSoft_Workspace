import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('🔄 Testing DRAG-DROP node creation\n');
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.react-flow__node').count();
    console.log(`Initial nodes: ${initialCount}`);

    // Find first palette node
    const paletteNode = await page.locator('[class*="node-row"]').first();
    console.log('✓ Found palette node');

    // Find canvas pane
    const canvasPane = await page.locator('.react-flow__pane').first();
    console.log('✓ Found canvas pane');

    // Try manual drag-drop with simulated events
    console.log('\nAttempting drag-drop...');
    
    const nodeBounds = await paletteNode.boundingBox();
    const canvasBounds = await canvasPane.boundingBox();

    await page.mouse.move(nodeBounds.x + nodeBounds.width / 2, nodeBounds.y + nodeBounds.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    
    await page.mouse.move(canvasBounds.x + 200, canvasBounds.y + 200);
    await page.waitForTimeout(100);
    
    await page.mouse.up();
    await page.waitForTimeout(500);

    const finalCount = await page.locator('.react-flow__node').count();
    console.log(`Final nodes: ${finalCount}`);

    if (finalCount > initialCount) {
      console.log(`\n✅ DRAG-DROP WORKS! Added ${finalCount - initialCount} node(s)`);
    } else {
      console.log(`\n❌ Drag-drop still not working`);
      console.log('📌 Use CLICK method instead (works perfectly)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
