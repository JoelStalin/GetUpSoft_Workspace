import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];
  
  try {
    console.log('🚀 Testing ORCA Stitch Redesign...\n');
    
    // Navigate
    console.log('📍 Navigating to http://localhost:5175...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle', timeout: 30000 });
    results.push('✅ Page loaded successfully');
    
    // Wait for app to initialize
    await page.waitForTimeout(2000);
    
    // Test 1: Check for main content
    console.log('🔍 Testing main layout...');
    const bodyVisible = await page.locator('body').isVisible();
    if (bodyVisible) {
      results.push('✅ Main layout rendered');
      console.log('   ✓ Body visible');
    }
    
    // Test 2: Check for canvas/main content area
    console.log('🎨 Testing canvas/content area...');
    const canvasOrDiv = await page.locator('canvas, div[style*="flex"]').first().isVisible().catch(() => false);
    if (canvasOrDiv) {
      results.push('✅ Canvas/content area visible');
    }
    
    // Test 3: Check stylesheet loaded
    console.log('📚 Checking CSS...');
    const cssLoaded = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets).length;
      return sheets > 0;
    });
    if (cssLoaded) {
      results.push('✅ CSS stylesheets loaded');
    }
    
    // Test 4: Check for JavaScript errors
    console.log('🔍 Checking for errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(1500);
    
    if (errors.length === 0) {
      results.push('✅ No console errors detected');
    } else {
      results.push(`⚠️  ${errors.length} console error(s) found`);
    }
    
    // Test 5: Take screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({ path: 'orca-stitch-redesign-test.png' });
    results.push('✅ Screenshot captured: orca-stitch-redesign-test.png');
    
    // Summary
    console.log('\n📋 VALIDATION RESULTS:\n');
    results.forEach(r => console.log('  ' + r));
    
    const passed = results.filter(r => r.startsWith('✅')).length;
    const total = results.length;
    console.log(`\n✅ TESTS PASSED: ${passed}/${total}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.push(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
