import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Just close any modal and show canvas
  const closeBtn = await page.$('[aria-label*="close"]');
  if (closeBtn) {
    await closeBtn.click();
    console.log('Modal closed');
  }
  
  // Look for any close buttons (X icons)
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons`);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i}: "${text?.substring(0, 20)}"`);
  }
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'evidence/modal-inspect.png', fullPage: true });
  
  await browser.close();
})();
