import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Loading page...');
    await page.goto('http://localhost:5173', { timeout: 30000 });

    // Check if nodes exist in DOM
    const nodes = await page.locator('text=/Start Trigger|Fetch Data|Process AI/').count();
    console.log(`Found ${nodes} default nodes`);

    // Check canvas SVG size
    const svgs = await page.locator('svg').count();
    console.log(`Found ${svgs} SVG elements`);

    // Get center container bounds
    const centerContainer = await page.locator('.flex-col.relative').filter({ has: page.locator('svg') }).first();
    const bounds = await centerContainer.boundingBox();
    console.log(`Center container bounds:`, bounds);

    // Check toolbar
    const toolbar = await page.locator('.h-16').first();
    const toolbarBounds = await toolbar.boundingBox();
    console.log(`Toolbar bounds:`, toolbarBounds);

    // Check sidebar
    const sidebar = await page.locator('[class*="flex-shrink-0"][class*="border-r"]').first();
    const sidebarBounds = await sidebar.boundingBox();
    console.log(`Sidebar bounds:`, sidebarBounds);

    // Check if nodes are visible
    const startNode = await page.locator('text=Start Trigger').first();
    const isVisible = await startNode.isVisible();
    console.log(`Start Trigger node visible: ${isVisible}`);

    if (isVisible) {
      const nodeBounds = await startNode.boundingBox();
      console.log(`Start Trigger node bounds:`, nodeBounds);
    }

    // Check main content container
    const mainContent = await page.locator('.flex-row.flex-1').first();
    const mainContentBounds = await mainContent.boundingBox();
    console.log(`Main content (flex-row) bounds:`, mainContentBounds);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
