import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/visible-nodes-final.png' });
  console.log('✓ Screenshot: Nodes with improved styling');
  
  // Scroll to see if nodes appear
  const canvas = await page.locator('[role="application"]').first();
  if (canvas) {
    // Try to find visible text in canvas
    const allText = await page.locator('[class*="react-flow"]').allTextContents();
    console.log('Canvas text content:', allText.join(' | ').substring(0, 100));
  }
  
  await browser.close();
})();
