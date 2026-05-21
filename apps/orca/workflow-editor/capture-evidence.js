const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureEvidence() {
  const screenshotsDir = path.join(__dirname, 'evidence-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Opening app at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Screenshot 1: App loaded
    console.log('Capturing screenshot 1: App loaded');
    await page.screenshot({ path: path.join(screenshotsDir, '01-app-loaded.png') });

    // Screenshot 2: Open search with Ctrl+K
    console.log('Capturing screenshot 2: Opening search dialog with Ctrl+K');
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '02-search-opened.png') });

    // Screenshot 3: Search with empty query (show history/suggestions)
    console.log('Capturing screenshot 3: Search suggestions view');
    await page.screenshot({ path: path.join(screenshotsDir, '03-search-suggestions.png') });

    // Screenshot 4: Type search query
    console.log('Capturing screenshot 4: Search with fuzzy matching');
    await page.keyboard.type('http', { delay: 100 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '04-search-results.png') });

    // Screenshot 5: Navigate with arrow keys
    console.log('Capturing screenshot 5: Keyboard navigation (↑↓)');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotsDir, '05-search-selected.png') });

    // Screenshot 6: Clear and show favorites (if any)
    console.log('Capturing screenshot 6: Recent searches');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Open search again
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '06-search-history-view.png') });

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Saved to: ${screenshotsDir}`);
    console.log('\nEvidence files:');
    const files = fs.readdirSync(screenshotsDir).sort();
    files.forEach(f => console.log(`  - ${f}`));

  } catch (error) {
    console.error('Error capturing evidence:', error);
  } finally {
    await browser.close();
  }
}

captureEvidence();
