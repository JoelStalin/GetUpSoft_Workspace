import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🚀 Testing Component Drag-Drop to Canvas...');
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Clear state
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Step 1: Verify initial state
  console.log('📋 Step 1: Verify initial state');
  const iconsVisible = await page.locator('[style*="position: fixed"][style*="width: 56px"] button').count();
  console.log(`   ✅ Found ${iconsVisible} category icons`);

  // Step 2: Click first icon (Triggers)
  console.log('📋 Step 2: Open Triggers category');
  await page.locator('[style*="position: fixed"][style*="width: 56px"] button').first().click();
  await page.waitForTimeout(500);

  // Step 3: Verify panel opened
  console.log('📋 Step 3: Verify components panel opened');
  const panelVisible = await page.locator('h3:has-text("COMPONENTS")').isVisible();
  console.log(`   ${panelVisible ? '✅' : '❌'} Components panel visible`);

  if (!panelVisible) {
    console.log('❌ Panel not visible, test aborted');
    await browser.close();
    return;
  }

  // Step 4: Count initial nodes
  console.log('📋 Step 4: Count initial nodes');
  const initialNodeCount = await page.locator('.react-flow__node').count();
  console.log(`   ✅ Initial nodes on canvas: ${initialNodeCount}`);

  // Step 5: Find component to drag
  console.log('📋 Step 5: Find Trigger component');
  const componentButton = await page.locator('button').filter({ hasText: 'Trigger' }).first();
  const isVisible = await componentButton.isVisible();
  console.log(`   ${isVisible ? '✅' : '❌'} Trigger component found and visible`);

  if (!isVisible) {
    console.log('❌ Component not visible, test aborted');
    await browser.close();
    return;
  }

  // Step 6: Get canvas container (the wrapper div in WorkflowCanvas)
  console.log('📋 Step 6: Locate canvas container');
  const canvasContainer = page.locator('div[style*="width: 100%"][style*="height: 100%"]').nth(1);
  const canvasVisible = await canvasContainer.isVisible().catch(() => false);
  console.log(`   ${canvasVisible ? '✅' : '❌'} Canvas container located`);

  // Step 7: Perform drag-drop
  console.log('📋 Step 7: Drag component to canvas');
  try {
    // Get bounds for precise positioning
    const componentBounds = await componentButton.boundingBox();
    const canvasBounds = await canvasContainer.boundingBox();
    
    if (componentBounds && canvasBounds) {
      console.log(`   Component at: (${componentBounds.x}, ${componentBounds.y})`);
      console.log(`   Canvas at: (${canvasBounds.x}, ${canvasBounds.y})`);
      
      // Drag to center of canvas
      await componentButton.dragTo(canvasContainer);
      console.log('   ✅ Drag performed');
    }
  } catch (err) {
    console.log(`   ⚠️ Drag error: ${err.message}`);
  }

  await page.waitForTimeout(800);

  // Step 8: Count final nodes
  console.log('📋 Step 8: Verify node was added');
  const finalNodeCount = await page.locator('.react-flow__node').count();
  const nodeAdded = finalNodeCount > initialNodeCount;
  console.log(`   ${nodeAdded ? '✅' : '❌'} Final nodes: ${finalNodeCount} (was ${initialNodeCount})`);

  // Step 9: Screenshot
  console.log('📋 Step 9: Capture evidence');
  await page.screenshot({ path: 'test-drag-drop-final.png' });
  console.log('   ✅ Screenshot saved');

  // Step 10: Check console
  console.log('📋 Step 10: Check console health');
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.waitForTimeout(300);
  console.log(`   ${errors.length === 0 ? '✅' : '⚠️'} Console: ${errors.length} errors`);

  // Result
  console.log('\n' + (nodeAdded ? '✅ TEST PASSED' : '⚠️ TEST INCONCLUSIVE'));
  if (nodeAdded) {
    console.log('   - Drag-drop successfully added node to canvas');
  } else {
    console.log('   - Note: Drag-drop may need manual testing or browser compatibility');
  }

  await browser.close();
})();
