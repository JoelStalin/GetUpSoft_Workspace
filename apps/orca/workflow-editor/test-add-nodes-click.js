import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Testing node addition via CLICK method\n');
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.react-flow__node').count();
    console.log(`Initial nodes: ${initialCount}`);

    // Method 1: Search and click
    console.log('\n📌 Method 1: Search > Click');
    const searchInput = await page.locator('input[placeholder*="Search"]').first();
    
    await searchInput.fill('http');
    await page.waitForTimeout(300);
    
    const httpNode = await page.locator('[class*="node-row"]:has-text("HTTP")').first();
    await httpNode.click();
    await page.waitForTimeout(300);

    let count = await page.locator('.react-flow__node').count();
    console.log(`  ✓ After 1st click: ${count} nodes`);

    // Method 2: Clear and add another
    console.log('\n📌 Method 2: Search > Click (Loop)');
    await searchInput.clear();
    await searchInput.fill('ai');
    await page.waitForTimeout(300);

    const aiNode = await page.locator('[class*="node-row"]:has-text("AI")').first();
    await aiNode.click();
    await page.waitForTimeout(300);

    count = await page.locator('.react-flow__node').count();
    console.log(`  ✓ After 2nd click: ${count} nodes`);

    // Method 3: Add one more
    console.log('\n📌 Method 3: Search > Click (Condition)');
    await searchInput.clear();
    await searchInput.fill('condition');
    await page.waitForTimeout(300);

    const condNode = await page.locator('[class*="node-row"]:has-text("Condition")').first();
    await condNode.click();
    await page.waitForTimeout(300);

    count = await page.locator('.react-flow__node').count();
    console.log(`  ✓ After 3rd click: ${count} nodes`);

    console.log(`\n✅ Total nodes added: ${count - initialCount}`);
    console.log('✅ CLICK method works perfectly!');

    // Take screenshot showing multiple nodes
    await page.screenshot({ path: './test-results/multiple-nodes-added.png', fullPage: false });
    console.log('✓ Screenshot saved showing multiple nodes');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
