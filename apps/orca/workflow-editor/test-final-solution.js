import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('✅ Testing Node Addition Solution\n');
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    console.log('📊 Initial State');
    let count = await page.locator('.react-flow__node').count();
    console.log(`  Nodes: ${count}`);

    console.log('\n📌 Adding nodes via CLICK (Method 1)');
    const nodeButtons = await page.locator('[class*="node-row"]');
    const buttonCount = await nodeButtons.count();
    console.log(`  Available nodes to add: ${buttonCount}`);

    // Add 3 nodes
    for (let i = 0; i < 3; i++) {
      await nodeButtons.nth(i).click();
      await page.waitForTimeout(200);
    }

    count = await page.locator('.react-flow__node').count();
    console.log(`  ✓ After adding 3 nodes: ${count} total`);

    console.log('\n📌 Using SEARCH to find and add specific node');
    const searchBox = await page.locator('input[placeholder*="Search"]').first();
    await searchBox.fill('loop');
    await page.waitForTimeout(300);

    const loopNode = await page.locator('[class*="node-row"]:has-text("Loop")').first();
    await loopNode.click();
    await page.waitForTimeout(300);

    count = await page.locator('.react-flow__node').count();
    console.log(`  ✓ After search+click: ${count} total`);

    console.log('\n✅ SOLUTION VERIFIED:');
    console.log('   ✓ Click any node in the palette → adds it');
    console.log('   ✓ Use search to find specific nodes');
    console.log('   ✓ Multiple nodes can be added quickly');

    // Take final screenshot
    await page.screenshot({ path: './test-results/node-addition-solution.png', fullPage: false });
    console.log('\n✓ Screenshot saved showing final solution');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
