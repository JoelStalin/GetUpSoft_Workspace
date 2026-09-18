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
  page.setViewportSize({ width: 1280, height: 900 });

  try {
    console.log('Opening app at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot 1: Full app with execution panel
    console.log('Capturing screenshot 1: App with Execution Timeline panel');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-01-main.png') });

    // Screenshot 2: Collapse panel
    console.log('Capturing screenshot 2: Collapsing execution panel');
    const panelButton = await page.locator('button:has-text("Execution Logs")').first();
    if (panelButton) {
      await panelButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase4-02-collapsed.png') });
    }

    console.log('\n✅ Phase 4 screenshots captured!');
    console.log(`📁 Saved to: ${screenshotsDir}`);
    const files = fs.readdirSync(screenshotsDir).filter(f => f.startsWith('phase4')).sort();
    files.forEach(f => {
      const size = fs.statSync(path.join(screenshotsDir, f)).size;
      console.log(`  ✓ ${f} (${(size / 1024).toFixed(1)}KB)`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureEvidence();
