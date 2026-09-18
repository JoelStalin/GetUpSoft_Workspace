import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Testing Phase 2 Implementation...\n');
    await page.goto('http://localhost:5173', { timeout: 30000 });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded');

    // Check if app mounted
    const root = await page.locator('#root').first();
    const rootVisible = await root.isVisible();
    console.log(`✓ Root element visible: ${rootVisible}`);

    // Look for any nodes or canvas
    const nodes = await page.locator('.react-flow__node').count();
    console.log(`✓ React-Flow nodes found: ${nodes}`);

    const canvas = await page.locator('.react-flow__viewport').first();
    const canvasVisible = await canvas.isVisible();
    console.log(`✓ Canvas viewport visible: ${canvasVisible}`);

    // Check what's actually in the DOM
    const html = await page.content();
    const hasStartTrigger = html.includes('Start Trigger');
    const hasFetchData = html.includes('Fetch Data');
    const hasProcessAI = html.includes('Process AI');

    console.log(`\n✓ "Start Trigger" in DOM: ${hasStartTrigger}`);
    console.log(`✓ "Fetch Data" in DOM: ${hasFetchData}`);
    console.log(`✓ "Process AI" in DOM: ${hasProcessAI}`);

    // Take screenshot
    await page.screenshot({ path: './test-results/phase2-debug.png', fullPage: false });
    console.log('\n✓ Debug screenshot saved');

    if (nodes > 0) {
      console.log('\n✅ NODES ARE RENDERING');
    } else if (hasStartTrigger && hasFetchData && hasProcessAI) {
      console.log('\n⚠️  Nodes exist in DOM but not visible - CSS/visibility issue');
    } else {
      console.log('\n❌ Nodes not found in DOM');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
