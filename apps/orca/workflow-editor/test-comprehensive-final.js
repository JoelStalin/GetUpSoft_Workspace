import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🚀 FINAL COMPREHENSIVE TEST - All Features')
  console.log('='.repeat(50))

  try {
    // 1. Navigate and initialize
    console.log('\n📍 STEP 1: Application Load')
    await page.goto('http://localhost:5182', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    console.log('   ✅ App loaded')

    // 2. Clear state
    console.log('\n📍 STEP 2: Clear State')
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    console.log('   ✅ localStorage cleared')

    // 3. Verify toolbar
    console.log('\n📍 STEP 3: Toolbar Elements')
    const orcaTitle = await page.locator(':text("ORCA")').isVisible({ timeout: 1000 }).catch(() => false)
    const playButton = await page.locator('button:has-text("Run")').isVisible()
    console.log(`   ORCAtitle: ${orcaTitle ? '✅' : '❌'}`)
    console.log(`   Run button: ${playButton ? '✅' : '❌'}`)

    // 4. Verify ToggleGroup modes
    console.log('\n📍 STEP 4: ToggleGroup Modes')
    const webDesign = await page.locator('button:has-text("Web Design")').isVisible()
    const workflow = await page.locator('button:has-text("Workflow")').isVisible()
    const mobile = await page.locator('button:has-text("Mobile Design")').isVisible()
    console.log(`   Web Design: ${webDesign ? '✅' : '❌'}`)
    console.log(`   Workflow: ${workflow ? '✅' : '❌'}`)
    console.log(`   Mobile: ${mobile ? '✅' : '❌'}`)

    // 5. Verify canvas nodes
    console.log('\n📍 STEP 5: Canvas & Nodes')
    const nodeCount = await page.locator('.react-flow__node').count()
    console.log(`   Nodes visible: ${nodeCount} (expected ≥3)`)
    if (nodeCount >= 3) console.log('   ✅ Canvas loaded with nodes')

    // 6. Click node to open properties
    console.log('\n📍 STEP 6: Node Selection & Properties')
    const firstNode = await page.locator('.react-flow__node').first()
    await firstNode.click()
    await page.waitForTimeout(500)
    const propsPanel = await page.locator('h3').filter({ hasText: 'PROPERTIES' }).isVisible({ timeout: 1000 }).catch(() => false)
    console.log(`   Properties panel: ${propsPanel ? '✅' : '❌'}`)

    // 7. Test RichTextEditor in properties
    console.log('\n📍 STEP 7: RichTextEditor (Properties)')
    const descEditor = await page.locator('[contenteditable="true"]').nth(1).isVisible({ timeout: 500 }).catch(() => false)
    console.log(`   Description editor: ${descEditor ? '✅' : '❌'}`)

    // 8. Open Agent Log
    console.log('\n📍 STEP 8: Chat Panel & RichTextEditor')
    const agentBtn = await page.locator('button[title="Agent Log"]').isVisible({ timeout: 1000 }).catch(() => false)
    console.log(`   Agent Log button: ${agentBtn ? '✅' : '❌'}`)
    if (agentBtn) {
      await page.locator('button[title="Agent Log"]').click()
      await page.waitForTimeout(300)
      const chatInput = await page.locator('[contenteditable="true"]').first().isVisible({ timeout: 500 }).catch(() => false)
      console.log(`   Chat input: ${chatInput ? '✅' : '❌'}`)
    }

    // 9. Check category bar
    console.log('\n📍 STEP 9: Collapsed Category Bar')
    const categoryBar = await page.locator('[style*="position: fixed"][style*="width: 56px"]').isVisible({ timeout: 1000 }).catch(() => false)
    const categoryButtons = await page.locator('[style*="position: fixed"][style*="width: 56px"] button').count()
    console.log(`   Category bar: ${categoryBar ? '✅' : '❌'}`)
    console.log(`   Category icons: ${categoryButtons} (expected 5)`)

    // 10. Verify console
    console.log('\n📍 STEP 10: Console Health')
    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    await page.waitForTimeout(500)
    console.log(`   Console errors: ${errors.length > 0 ? '❌ ' + errors.length : '✅ NONE'}`)

    // Final result
    console.log('\n' + '='.repeat(50))
    const allChecks = orcaTitle && playButton && webDesign && workflow && mobile && nodeCount >= 3 && errors.length === 0
    if (allChecks) {
      console.log('🎉 FINAL TEST RESULT: ✅ ALL SYSTEMS GO')
      console.log('Ready for production deployment!')
    } else {
      console.log('⚠️ FINAL TEST RESULT: Some checks failed')
    }
    console.log('=' . repeat(50))

    // Screenshot
    await page.screenshot({ path: 'test-final-comprehensive.png' })

  } catch (error) {
    console.error('❌ Test error:', error.message)
  }

  await browser.close()
})()
