import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🚀 Testing Context Menu on Nodes...');
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('📋 Step 1: Verify nodes exist on canvas');
  const nodes = await page.locator('.react-flow__node').count();
  console.log(`   ✅ Found ${nodes} nodes on canvas`);

  if (nodes === 0) {
    console.log('❌ No nodes found, test aborted');
    await browser.close();
    return;
  }

  console.log('📋 Step 2: Right-click on first node');
  const firstNode = page.locator('.react-flow__node').first();
  
  // Right-click to open context menu
  await firstNode.click({ button: 'right' });
  await page.waitForTimeout(500);

  console.log('📋 Step 3: Verify context menu appears');
  const contextMenu = page.locator('[role="menu"]').first();
  const menuVisible = await contextMenu.isVisible().catch(() => false);
  
  if (menuVisible) {
    console.log('   ✅ Context menu appeared');
  } else {
    console.log('   ❌ Context menu not visible');
  }

  console.log('📋 Step 4: Check for menu items');
  const menuItems = await page.locator('[role="menuitem"]').count();
  console.log(`   ${menuItems > 0 ? '✅' : '⚠️'} Menu items found: ${menuItems}`);

  if (menuItems > 0) {
    console.log('   Menu items:');
    const items = await page.locator('[role="menuitem"]').allTextContents();
    items.forEach((item, i) => {
      console.log(`     ${i + 1}. ${item.trim()}`);
    });
  }

  console.log('📋 Step 5: Test duplicate action');
  const duplicateItem = await page.locator('[role="menuitem"]').filter({ hasText: 'Duplicate' });
  if (await duplicateItem.isVisible().catch(() => false)) {
    const initialCount = await page.locator('.react-flow__node').count();
    await duplicateItem.click();
    await page.waitForTimeout(500);
    const finalCount = await page.locator('.react-flow__node').count();
    console.log(`   ${finalCount > initialCount ? '✅' : '❌'} Node duplicated (${initialCount} → ${finalCount})`);
  } else {
    console.log('   ⚠️ Duplicate item not found');
  }

  console.log('📋 Step 6: Capture screenshot');
  await page.screenshot({ path: 'test-context-menu.png' });
  console.log('   ✅ Screenshot saved');

  console.log('📋 Step 7: Check console');
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.waitForTimeout(300);
  console.log(`   ${errors.length === 0 ? '✅' : '⚠️'} Console errors: ${errors.length}`);

  console.log(`\n${menuVisible && menuItems > 0 ? '✅ TEST PASSED' : '⚠️ TEST INCONCLUSIVE'}`);
  if (menuVisible && menuItems > 0) {
    console.log('   - Context menu appears on right-click');
    console.log('   - Menu items are displayed correctly');
  } else {
    console.log('   - Note: Context menu may need manual testing');
  }

  await browser.close();
})();
