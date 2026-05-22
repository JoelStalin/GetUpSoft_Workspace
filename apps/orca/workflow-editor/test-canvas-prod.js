import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Loading production build...');
    await page.goto('http://localhost:8080', { timeout: 30000 });

    // Take screenshot of full page
    await page.screenshot({ path: './test-results/canvas-render.png', fullPage: false });
    console.log('✓ Screenshot saved to ./test-results/canvas-render.png');

    // Check if nodes exist in DOM
    const startNode = await page.locator('text=Start Trigger').first();
    const hasStartNode = await startNode.isVisible().catch(() => false);
    console.log(`✓ Start Trigger visible: ${hasStartNode}`);

    const fetchNode = await page.locator('text=Fetch Data').first();
    const hasFetchNode = await fetchNode.isVisible().catch(() => false);
    console.log(`✓ Fetch Data visible: ${hasFetchNode}`);

    const processNode = await page.locator('text=Process AI').first();
    const hasProcessNode = await processNode.isVisible().catch(() => false);
    console.log(`✓ Process AI visible: ${hasProcessNode}`);

    // Check canvas area
    const canvas = await page.locator('.react-flow__renderer').first();
    const canvasVisible = await canvas.isVisible().catch(() => false);
    console.log(`✓ Canvas element visible: ${canvasVisible}`);

    // Get root container bounds
    const root = await page.locator('#root').first();
    const rootBounds = await root.boundingBox();
    console.log(`✓ Root container bounds:`, rootBounds);

    // Check for app content
    const appContent = await page.locator('[class*="flex"]').first();
    const appBounds = await appContent.boundingBox();
    console.log(`✓ App content bounds:`, appBounds);

    if (hasStartNode && hasFetchNode && hasProcessNode && canvasVisible) {
      console.log('\n✅ ALL TESTS PASSED - Canvas and nodes rendering correctly!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Some elements not visible');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
