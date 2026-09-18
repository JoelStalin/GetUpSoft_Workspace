import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // Check for errors in console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Browser Error: ${msg.text()}`);
    }
  });
  
  // Take screenshot
  await page.screenshot({ path: 'evidence/production-ready-layout.png' });
  console.log('✓ Screenshot: Production ready layout');
  
  // Check for content
  const nodeText = await page.$eval('[class*="react-flow__node"]', el => el.textContent);
  console.log(`✓ Node content found: "${nodeText?.substring(0, 30)}..."`);
  
  await browser.close();
})();
