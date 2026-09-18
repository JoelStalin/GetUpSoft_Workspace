import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Loading page...');
    await page.goto('http://localhost:5173', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Get root element styles
    const rootStyles = await page.locator('.fixed.inset-0').first().evaluate(el => ({
      display: window.getComputedStyle(el).display,
      flexDirection: window.getComputedStyle(el).flexDirection,
      height: window.getComputedStyle(el).height,
      width: window.getComputedStyle(el).width,
      position: window.getComputedStyle(el).position,
    }));
    console.log('Root container styles:', rootStyles);

    // Get main content styles
    const mainContentStyles = await page.locator('.flex-1.overflow-hidden.flex.flex-row').first().evaluate(el => ({
      display: window.getComputedStyle(el).display,
      flex: window.getComputedStyle(el).flex,
      flexDirection: window.getComputedStyle(el).flexDirection,
      height: window.getComputedStyle(el).height,
      minHeight: window.getComputedStyle(el).minHeight,
    }));
    console.log('Main content styles:', mainContentStyles);

    // Check if there's max-height somewhere
    const mainContentAllStyles = await page.locator('.flex-1.overflow-hidden.flex.flex-row').first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        maxHeight: styles.maxHeight,
        maxWidth: styles.maxWidth,
        overflow: styles.overflow,
      };
    });
    console.log('Main content overflow/max styles:', mainContentAllStyles);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
