import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Find the Generate button and click it
  const generateBtn = await page.$('button');
  let clicked = false;
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('Generate')) {
      await btn.click();
      clicked = true;
      console.log('Generate button clicked');
      break;
    }
  }
  
  if (clicked) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'evidence/with-nodes-generated.png', fullPage: true });
    console.log('✓ Screenshot: Generated workflow');
  } else {
    console.log('Generate button not found, using drag test');
    
    // Get elements
    const trigger = await page.locator('text=Trigger').first();
    const canvas = await page.locator('[class*="react-flow"]').first();
    
    if (trigger && canvas) {
      // Get bounding boxes
      const triggerBox = await trigger.boundingBox();
      const canvasBox = await canvas.boundingBox();
      
      if (triggerBox && canvasBox) {
        // Calculate target position (center of canvas)
        const targetX = canvasBox.x + canvasBox.width * 0.6;
        const targetY = canvasBox.y + canvasBox.height / 2;
        
        // Drag trigger to canvas
        await page.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.move(targetX, targetY);
        await page.waitForTimeout(100);
        await page.mouse.up();
        
        await page.waitForTimeout(800);
        console.log('✓ Node dragged to canvas');
        
        await page.screenshot({ path: 'evidence/with-dragged-node.png', fullPage: true });
      }
    }
  }
  
  await browser.close();
})();
