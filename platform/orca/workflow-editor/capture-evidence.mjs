import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureEvidence() {
  const screenshotsDir = path.join(__dirname, 'evidence-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('Opening app at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Screenshot 1: App loaded
    console.log('Capturing screenshot 1: App loaded');
    await page.screenshot({ path: path.join(screenshotsDir, '01-app-loaded.png') });

    // Screenshot 2: Open search with Ctrl+K
    console.log('Capturing screenshot 2: Opening search dialog with Ctrl+K');
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '02-search-opened.png') });

    // Screenshot 3: Search suggestions view (empty query)
    console.log('Capturing screenshot 3: Search suggestions view');
    await page.screenshot({ path: path.join(screenshotsDir, '03-search-suggestions.png') });

    // Screenshot 4: Type search query
    console.log('Capturing screenshot 4: Search with fuzzy matching');
    await page.keyboard.type('http', { delay: 100 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '04-search-results.png') });

    // Screenshot 5: Navigate with arrow keys
    console.log('Capturing screenshot 5: Keyboard navigation');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '05-search-selected.png') });

    // Screenshot 6: Close and reopen to show history
    console.log('Capturing screenshot 6: Recent searches history');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '06-search-history.png') });

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Saved to: ${screenshotsDir}`);
    console.log('\nEvidence files:');
    const files = fs.readdirSync(screenshotsDir).sort();
    files.forEach(f => {
      const size = fs.statSync(path.join(screenshotsDir, f)).size;
      console.log(`  ✓ ${f} (${(size / 1024).toFixed(1)}KB)`);
    });

  } catch (error) {
    console.error('Error capturing evidence:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureEvidence();
