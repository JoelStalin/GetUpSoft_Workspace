import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('🎯 Testing FIXED Drag-Drop\n');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.react-flow__node').count();
    console.log(`Initial nodes: ${initialCount}`);

    // Get palette node and canvas
    const paletteNode = await page.locator('[class*="node-row"]').nth(2);
    const wrapper = await page.locator('div[style*="100%"]').first();

    console.log('\nDragging node to canvas...');
    
    // Get exact positions
    const nodeBounds = await paletteNode.boundingBox();
    const wrapperBounds = await wrapper.boundingBox();

    // Use mouse operations for better control
    await page.mouse.move(nodeBounds.x + 50, nodeBounds.y + 20);
    await page.mouse.down();
    console.log('✓ Mouse down on node');
    
    await page.waitForTimeout(100);
    
    // Move over canvas
    await page.mouse.move(wrapperBounds.x + wrapperBounds.width / 2, wrapperBounds.y + wrapperBounds.height / 2, { steps: 5 });
    console.log('✓ Mouse moved to canvas');
    
    await page.waitForTimeout(200);
    await page.mouse.up();
    console.log('✓ Mouse up');

    await page.waitForTimeout(500);

    const finalCount = await page.locator('.react-flow__node').count();
    console.log(`\nFinal nodes: ${finalCount}`);

    if (finalCount > initialCount) {
      console.log(`\n✅ DRAG-DROP WORKS! Added ${finalCount - initialCount} node(s)`);
      process.exit(0);
    } else {
      console.log(`\n⚠️  Not working with mouse simulation`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
