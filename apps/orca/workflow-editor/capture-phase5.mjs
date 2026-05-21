import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capturePhase5() {
  const screenshotsDir = path.join(__dirname, 'evidence-screenshots');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 900 });

  try {
    console.log('Opening app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('1. Capturing initial app with Node Library');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase5-01-interface.png') });

    console.log('2. Scrolling down to show full features');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase5-02-features.png') });

    console.log('✅ Phase 5 screenshots captured!');
    const files = fs.readdirSync(screenshotsDir)
      .filter(f => f.startsWith('phase5-0'))
      .sort();
    files.forEach(f => {
      const size = fs.statSync(path.join(screenshotsDir, f)).size;
      console.log(`  ✓ ${f} (${(size / 1024).toFixed(1)}KB)`);
    });

  } finally {
    await browser.close();
  }
}

capturePhase5().catch(console.error);
