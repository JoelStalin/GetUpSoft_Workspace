import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    console.log('Testing Toolbar...\n');

    // Check toolbar buttons
    const undoButton = await page.locator('button:has-text("Undo")').first();
    const redoButton = await page.locator('button:has-text("Redo")').first();
    const runButton = await page.locator('button:has-text("Run")').first();

    const undoVisible = await undoButton.isVisible().catch(() => false);
    const redoVisible = await redoButton.isVisible().catch(() => false);
    const runVisible = await runButton.isVisible().catch(() => false);

    console.log(`✓ Undo button visible: ${undoVisible}`);
    console.log(`✓ Redo button visible: ${redoVisible}`);
    console.log(`✓ Run button visible: ${runVisible}`);

    // Take screenshots of different button states
    console.log('\nCapturing toolbar screenshots...');
    
    // Screenshot 1: Default state
    await page.screenshot({ path: './test-results/toolbar-default.png', clip: { x: 0, y: 0, width: 1920, height: 80 } });
    console.log('✓ Default state captured');

    // Screenshot 2: Hover on Run button
    await runButton.hover();
    await page.waitForTimeout(200);
    await page.screenshot({ path: './test-results/toolbar-hover.png', clip: { x: 0, y: 0, width: 1920, height: 80 } });
    console.log('✓ Hover state captured');

    // Check toolbar structure
    const toolbar = await page.locator('.workflow-toolbar').first();
    const toolbarVisible = await toolbar.isVisible();
    console.log(`\n✓ Toolbar visible: ${toolbarVisible}`);

    console.log('\n✅ TOOLBAR TESTS COMPLETE');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
