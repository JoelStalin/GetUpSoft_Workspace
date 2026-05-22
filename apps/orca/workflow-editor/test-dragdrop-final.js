import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('🎯 Testing Drag-Drop with Window Listeners\n');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.react-flow__node').count();
    console.log(`Initial nodes: ${initialCount}`);

    // Get elements
    const nodeItems = await page.locator('[class*="node-row"]');
    const itemCount = await nodeItems.count();
    console.log(`Available palette items: ${itemCount}`);

    // Try drag-drop multiple times
    for (let i = 0; i < 3; i++) {
      console.log(`\n[Test ${i + 1}] Dragging node...`);
      
      const item = nodeItems.nth(i);
      const canvas = await page.locator('div[style*="100%"]').first();

      const itemBounds = await item.boundingBox();
      const canvasBounds = await canvas.boundingBox();

      // Move to item
      await page.mouse.move(itemBounds.x + itemBounds.width / 2, itemBounds.y + itemBounds.height / 2);
      await page.waitForTimeout(50);

      // Drag to canvas
      await page.mouse.down();
      await page.waitForTimeout(100);

      await page.mouse.move(canvasBounds.x + 200 + i * 100, canvasBounds.y + 200 + i * 100, { steps: 10 });
      await page.waitForTimeout(200);

      await page.mouse.up();
      await page.waitForTimeout(300);

      const currentCount = await page.locator('.react-flow__node').count();
      console.log(`  Result: ${currentCount} nodes total`);

      if (currentCount > initialCount + i) {
        console.log(`  ✅ Node added!`);
      }
    }

    const finalCount = await page.locator('.react-flow__node').count();
    console.log(`\n📊 Final Result: ${finalCount} nodes (started with ${initialCount})`);

    if (finalCount > initialCount) {
      console.log(`✅ DRAG-DROP WORKS! Added ${finalCount - initialCount} nodes`);
      process.exit(0);
    } else {
      console.log(`❌ Drag-drop still not working`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
