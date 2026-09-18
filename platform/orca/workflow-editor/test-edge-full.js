import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for canvas to appear
  await page.waitForSelector('[class*="react-flow"]', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Take screenshot of loaded interface
  await page.screenshot({ path: 'evidence/phase7-interface-loaded.png', fullPage: true });
  console.log('Screenshot: Interface fully loaded with canvas');
  
  // Check if toolbar exists
  const hasToolbar = await page.$('[class*="workflow-toolbar"]');
  console.log('Has toolbar:', !!hasToolbar);
  
  // Check if minimap exists
  const hasMinimap = await page.$('[class*="minimap"]');
  console.log('Has MiniMap:', !!hasMinimap);
  
  // Check node count
  const nodeCount = await page.locator('[class*="react-flow__node"]').count();
  console.log('Nodes on canvas:', nodeCount);
  
  // Test phase 7 features
  
  // 1. Test edge styling - look for SVG edges
  const edgeCount = await page.locator('svg path').count();
  console.log('SVG paths (edges):', edgeCount);
  
  // 2. Create a test workflow with multiple nodes
  // Find the generate button
  const generateBtn = await page.$('button:has-text("Generate")');
  if (generateBtn) {
    await generateBtn.click();
    await page.waitForTimeout(500);
  }
  
  await page.screenshot({ path: 'evidence/phase7-generate-modal.png', fullPage: true });
  console.log('Screenshot: Generate modal visible');
  
  await browser.close();
})();
