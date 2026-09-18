import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('🔍 Debugging pointer-events blocking\n');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Check all layers that might be blocking
    const layers = await page.evaluate(() => {
      const elements = document.elementsFromPoint(960, 500);
      const info = [];
      
      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const el = elements[i];
        const style = window.getComputedStyle(el);
        info.push({
          tag: el.tagName,
          class: (el.className || '').substring(0, 50),
          pointerEvents: style.pointerEvents,
          display: style.display,
          zIndex: style.zIndex,
        });
      }
      return info;
    });

    console.log('Elements at center of canvas (top to bottom):');
    layers.forEach((l, i) => {
      console.log(`${i}. <${l.tag} class="${l.class}">`);
      console.log(`   pointerEvents: ${l.pointerEvents}, display: ${l.display}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
