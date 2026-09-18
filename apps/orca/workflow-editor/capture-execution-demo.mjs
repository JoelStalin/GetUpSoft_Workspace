import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureExecution() {
  const screenshotsDir = path.join(__dirname, 'evidence-screenshots');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 900 });

  try {
    console.log('Opening app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot 1: Initial state
    console.log('1. Capturing initial state');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-execution-01-initial.png') });

    // Click Run button (if visible)
    const runBtn = await page.locator('button:has-text("Run")').first();
    if (runBtn) {
      console.log('2. Clicking Run button');
      await runBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase4-execution-02-running.png') });

      // Wait for execution to complete
      await page.waitForTimeout(2500);
      console.log('3. Capturing completed execution');
      await page.screenshot({ path: path.join(screenshotsDir, 'phase4-execution-03-completed.png') });
    }

    console.log('\n✅ Execution demo captured!');
    const files = fs.readdirSync(screenshotsDir)
      .filter(f => f.startsWith('phase4-execution'))
      .sort();
    files.forEach(f => {
      const size = fs.statSync(path.join(screenshotsDir, f)).size;
      console.log(`  ✓ ${f} (${(size / 1024).toFixed(1)}KB)`);
    });

  } finally {
    await browser.close();
  }
}

captureExecution().catch(console.error);
