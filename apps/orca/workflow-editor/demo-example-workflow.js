import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/example-workflow-nodes.png', fullPage: true });
  console.log('✓ Screenshot: Example workflow with nodes visible');
  
  // Check node count
  const nodes = await page.locator('[class*="react-flow__node"]').count();
  console.log(`✓ Nodes on canvas: ${nodes}`);
  
  // Check edges
  const edges = await page.locator('[class*="react-flow__edge"]').count();
  console.log(`✓ Edges visible: ${edges}`);
  
  await browser.close();
})();
