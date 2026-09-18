import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for anything to load
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/phase7-full-interface.png', fullPage: true });
  console.log('Screenshot: Full interface');
  
  // Get page content
  const content = await page.content();
  if (content.includes('react-flow')) {
    console.log('✓ ReactFlow loaded');
  }
  if (content.includes('workflow-toolbar')) {
    console.log('✓ Toolbar loaded');
  }
  if (content.includes('Node Library')) {
    console.log('✓ Node Library visible');
  }
  
  // Try to find and interact with elements
  const buttons = await page.$$eval('button', buttons => buttons.map(b => b.textContent?.trim()));
  console.log('Buttons found:', buttons.slice(0, 5));
  
  await browser.close();
})();
