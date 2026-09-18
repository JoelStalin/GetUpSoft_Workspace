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

    // Screenshot 1: App with execution panel visible
    console.log('Capturing screenshot 1: App with Execution Timeline panel');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-01-execution-panel.png') });

    // Screenshot 2: Collapse execution panel
    console.log('Capturing screenshot 2: Collapsed execution panel');
    await page.click('button:has-text("Execution Logs")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-02-collapsed.png') });

    // Screenshot 3: Expand again
    console.log('Capturing screenshot 3: Expanded execution panel');
    await page.click('button:has-text("Execution Logs")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-03-expanded.png') });

    // Screenshot 4: Add a node and show status display
    console.log('Capturing screenshot 4: Nodes with status indicators');
    // Add a node by clicking in the canvas
    await page.click('.react-flow__viewport', { position: { x: 640, y: 400 } });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4-04-node-status.png') });

    console.log('\n✅ Phase 4 screenshots captured successfully!');
    console.log(`📁 Saved to: ${screenshotsDir}`);
    console.log('\nEvidence files:');
    const files = fs.readdirSync(screenshotsDir).filter(f => f.startsWith('phase4')).sort();
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
