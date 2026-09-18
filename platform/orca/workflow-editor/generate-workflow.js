import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Type in the workflow description
  const input = await page.$('textarea');
  if (input) {
    await input.click();
    await page.keyboard.type('Send an HTTP request, process the response with AI, and store the result');
    console.log('✓ Workflow description entered');
    
    await page.waitForTimeout(500);
    
    // Find and click Generate button in modal
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('generate')) {
        await btn.click();
        console.log('✓ Generate button clicked in modal');
        break;
      }
    }
    
    // Wait for workflow to be generated
    await page.waitForTimeout(3000);
    
    // Check if nodes appeared on canvas
    const nodeCount = await page.locator('[class*="react-flow__node"]').count();
    console.log(`✓ Nodes on canvas: ${nodeCount}`);
    
    // Take screenshot
    await page.screenshot({ path: 'evidence/workflow-with-nodes.png', fullPage: true });
    console.log('✓ Screenshot: Workflow with generated nodes');
  }
  
  await browser.close();
})();
