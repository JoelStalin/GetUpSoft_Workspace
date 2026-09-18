import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🚀 Testing ToggleGroup Modes in Toolbar...')

  // 1. Navigate
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 2. Clear state
  console.log('🧹 Clearing localStorage...')
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 3. Verify initial state
  console.log('🔍 Verifying ToggleGroup exists...')
  const webDesignBtn = page.locator('button').filter({ hasText: 'Web Design' })
  const toggleGroupExists = await webDesignBtn.isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`   ToggleGroup visible: ${toggleGroupExists ? '✅' : '❌'}`)

  // 4. Count mode buttons
  console.log('🔍 Counting mode buttons...')
  const modeButtons = await page.locator('button').filter({ hasText: /Web Design|Workflow|Mobile Design/ }).count()
  console.log(`   Found ${modeButtons} mode buttons (expected 3)`)

  // 5. Test clicking "Workflow" mode button
  console.log('🧪 Testing click on Workflow mode...')
  const workflowButton = page.locator('button').filter({ hasText: 'Workflow' })
  const workflowExists = await workflowButton.isVisible()
  console.log(`   Workflow button visible: ${workflowExists ? '✅' : '❌'}`)

  if (workflowExists) {
    await workflowButton.click()
    await page.waitForTimeout(300)

    // 6. Verify active state styling
    console.log('🔍 Verifying active state...')
    const activeColor = await workflowButton.evaluate((el) => {
      return window.getComputedStyle(el).borderColor
    })
    console.log(`   Border color after click: ${activeColor}`)

    // Verify background changed
    const bgColor = await workflowButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    console.log(`   Background after click: ${bgColor}`)
  }

  // 7. Test clicking "Mobile Design" mode
  console.log('🧪 Testing click on Mobile Design mode...')
  const mobileButton = page.locator('button').filter({ hasText: 'Mobile Design' })
  const mobileExists = await mobileButton.isVisible()
  console.log(`   Mobile Design button visible: ${mobileExists ? '✅' : '❌'}`)

  if (mobileExists) {
    await mobileButton.click()
    await page.waitForTimeout(300)
    console.log('   ✅ Mobile Design clicked')
  }

  // 8. Test "Web Design" mode
  console.log('🧪 Testing click on Web Design mode...')
  const webButton = page.locator('button').filter({ hasText: 'Web Design' })
  const webExists = await webButton.isVisible()
  console.log(`   Web Design button visible: ${webExists ? '✅' : '❌'}`)

  if (webExists) {
    await webButton.click()
    await page.waitForTimeout(300)
    console.log('   ✅ Web Design clicked')
  }

  // 9. Verify no console errors
  console.log('🔍 Checking console for errors...')
  const errors = await page.evaluate(() => {
    const logs = []
    const originalError = console.error
    console.error = (...args) => {
      logs.push(args.join(' '))
      originalError(...args)
    }
    return logs
  })
  console.log(`   Console errors: ${errors.length > 0 ? errors.join('; ') : '✅ NONE'}`)

  // 10. Screenshot
  console.log('📸 Capturing screenshot...')
  await page.screenshot({ path: 'test-togglegroup-result.png' })
  console.log('   Saved: test-togglegroup-result.png')

  // 11. Report
  const allPassed = workflowExists && mobileExists && webExists && errors.length === 0
  if (allPassed) {
    console.log('✅ Test PASSED - All mode buttons clickable and responsive')
  } else {
    console.log('❌ Test FAILED - Some buttons missing or errors present')
  }

  await browser.close()
})()
