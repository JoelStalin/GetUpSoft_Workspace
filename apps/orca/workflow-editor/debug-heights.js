import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(5000);
  
  // Get heights
  const measurements = await page.evaluate(() => {
    const main = document.querySelector('[class*="fixed"][class*="inset-0"]');
    const toolbar = document.querySelector('[class*="h-16"]');
    const mainContent = toolbar?.nextElementSibling;
    const center = mainContent?.querySelector('[class*="flex-1"]');
    const canvasWrapper = center?.querySelector('[class*="flex-1"]');
    const canvas = canvasWrapper?.querySelector('[class*="react-flow"]');
    
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      main: main ? { height: main.getBoundingClientRect().height, y: main.getBoundingClientRect().y } : null,
      toolbar: toolbar ? { height: toolbar.getBoundingClientRect().height, y: toolbar.getBoundingClientRect().y } : null,
      mainContent: mainContent ? { height: mainContent.getBoundingClientRect().height, y: mainContent.getBoundingClientRect().y } : null,
      center: center ? { height: center.getBoundingClientRect().height, y: center.getBoundingClientRect().y } : null,
      canvasWrapper: canvasWrapper ? { height: canvasWrapper.getBoundingClientRect().height, y: canvasWrapper.getBoundingClientRect().y } : null,
      canvas: canvas ? { height: canvas.getBoundingClientRect().height, y: canvas.getBoundingClientRect().y } : null,
    };
  });
  
  console.log('Height measurements:');
  console.log(JSON.stringify(measurements, null, 2));
  
  await browser.close();
})();
