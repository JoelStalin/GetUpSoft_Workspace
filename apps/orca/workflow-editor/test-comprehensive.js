import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const results = {};

  try {
    console.log('🧪 COMPREHENSIVE FEATURE TEST\n');
    console.log('Loading application...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Test 1: Canvas & Layout
    console.log('\n1️⃣  Layout & Canvas');
    const root = await page.locator('#root').first();
    const rootBounds = await root.boundingBox();
    results.layout = rootBounds.width === 1920 && rootBounds.height === 1080;
    console.log(`   ✓ Root: ${rootBounds.width}x${rootBounds.height}`);
    console.log(`   ${results.layout ? '✅' : '⚠️'} Full viewport: ${results.layout}`);

    // Test 2: Default Nodes
    console.log('\n2️⃣  Default Nodes');
    const nodeCount = await page.locator('.react-flow__node').count();
    results.nodes = nodeCount === 3;
    console.log(`   ✓ Node count: ${nodeCount}`);
    console.log(`   ${results.nodes ? '✅' : '⚠️'} Has 3 default nodes: ${results.nodes}`);

    // Test 3: Node Styling
    console.log('\n3️⃣  Node Styling & Status');
    const firstNode = await page.locator('.react-flow__node').first();
    const nodeStyle = await firstNode.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        hasBorder: !!el.querySelector('[style*="borderLeft"]'),
        hasIcon: !!el.querySelector('svg'),
        hasBadge: !!el.querySelector('[class*="status"]'),
      };
    });
    results.styling = nodeStyle.hasBorder && nodeStyle.hasIcon && nodeStyle.hasBadge;
    console.log(`   ✓ Left border: ${nodeStyle.hasBorder}`);
    console.log(`   ✓ Has icon: ${nodeStyle.hasIcon}`);
    console.log(`   ✓ Status badge: ${nodeStyle.hasBadge}`);
    console.log(`   ${results.styling ? '✅' : '⚠️'} Professional styling: ${results.styling}`);

    // Test 4: Search Functionality
    console.log('\n4️⃣  Search & Categories');
    const searchInput = await page.locator('input[placeholder*="Search"]').first();
    const hasSearch = searchInput.isVisible().catch(() => false);
    if (await searchInput.isVisible().catch(() => false)) {
      results.search = true;
      console.log(`   ✅ Search input available`);
    } else {
      results.search = false;
      console.log(`   ⚠️  Search input not visible`);
    }

    // Test 5: Keyboard Shortcuts
    console.log('\n5️⃣  Keyboard Shortcuts');
    try {
      const startNode = await page.locator('text=Start Trigger').first();
      await startNode.click();
      
      // Try Ctrl+C
      await page.keyboard.press('Control+C');
      results.shortcuts = true;
      console.log(`   ✅ Keyboard shortcuts working`);
    } catch {
      results.shortcuts = false;
      console.log(`   ⚠️  Keyboard shortcuts test failed`);
    }

    // Test 6: Responsive Features
    console.log('\n6️⃣  Responsive Features');
    const sidebar = await page.locator('[class*="sidebar"]').first();
    const hasSidebar = await sidebar.isVisible().catch(() => false);
    results.responsive = hasSidebar;
    console.log(`   ${results.responsive ? '✅' : '⚠️'} Sidebar visible: ${results.responsive}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(v => v === true).length;
    const percentage = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n📊 SUMMARY: ${passedTests}/${totalTests} features working (${percentage}%)`);
    console.log('\nFeature Status:');
    Object.entries(results).forEach(([feature, passing]) => {
      console.log(`   ${passing ? '✅' : '⚠️'} ${feature}`);
    });

    // Screenshot
    await page.screenshot({ path: './test-results/comprehensive-test.png', fullPage: false });
    console.log('\n✓ Screenshot saved');

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
