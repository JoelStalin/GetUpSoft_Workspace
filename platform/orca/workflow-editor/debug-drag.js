import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('🔍 Debugging drag-drop events\n');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Inject event listeners to see what's happening
    await page.evaluate(() => {
      document.addEventListener('dragstart', (e) => {
        console.log('dragstart:', e.dataTransfer.types);
      });
      document.addEventListener('dragover', (e) => {
        console.log('dragover on:', e.target.className);
      });
      document.addEventListener('drop', (e) => {
        console.log('drop on:', e.target.className);
        console.log('data:', e.dataTransfer.getData('application/reactflow'));
      });
    });

    // Get the structure
    const wrapper = await page.locator('[style*="width: 100%"][style*="height: 100%"]').first();
    const isWrapper = await wrapper.isVisible();
    console.log('Found wrapper:', isWrapper);

    const reactflow = await page.locator('.react-flow').first();
    const isReactflow = await reactflow.isVisible();
    console.log('Found ReactFlow container:', isReactflow);

    const pane = await page.locator('.react-flow__pane').first();
    const isPane = await pane.isVisible();
    console.log('Found ReactFlow pane:', isPane);

    // Check pointer-events style
    const paneStyle = await pane.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        pointerEvents: style.pointerEvents,
        display: style.display,
      };
    });
    console.log('\nPane style:', paneStyle);

    // Try a simpler drag
    console.log('\nAttempting simplified drag...');
    const nodeItem = await page.locator('[class*="node-row"]').first();
    const wrapper2 = await page.locator('div[style*="100%"][style*="100%"][onDragOver]').first();
    
    if (await wrapper2.isVisible()) {
      console.log('✓ Found droppable wrapper');
      
      // Get bounds
      const itemBounds = await nodeItem.boundingBox();
      const wrapperBounds = await wrapper2.boundingBox();
      
      console.log('Item bounds:', itemBounds);
      console.log('Wrapper bounds:', wrapperBounds);
      
      // Try drag
      await nodeItem.dragTo(wrapper2, { 
        sourcePosition: { x: itemBounds.width / 2, y: itemBounds.height / 2 },
        targetPosition: { x: wrapperBounds.width / 2, y: wrapperBounds.height / 2 }
      });
      
      await page.waitForTimeout(500);
      const count = await page.locator('.react-flow__node').count();
      console.log('Nodes after drag:', count);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
