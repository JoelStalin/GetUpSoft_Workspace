import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capturePhase6() {
  const screenshotsDir = path.join(__dirname, 'evidence-screenshots');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 900 });

  try {
    console.log('Opening app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('1. Capturing Phase 6 interface');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase6-01-interface.png') });

    console.log('2. Showing Node Library with search');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase6-02-nodes.png') });

    console.log('✅ Phase 6 screenshots captured!');
    const files = fs.readdirSync(screenshotsDir)
      .filter(f => f.startsWith('phase6-'))
      .sort();
    files.forEach(f => {
      const size = fs.statSync(path.join(screenshotsDir, f)).size;
      console.log(`  ✓ ${f} (${(size / 1024).toFixed(1)}KB)`);
    });

  } finally {
    await browser.close();
  }
}

capturePhase6().catch(console.error);
