import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🚀 Testing Properties Panel with RichTextEditor & ImageUpload...')

  // 1. Navigate
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 2. Clear state
  console.log('🧹 Clearing localStorage...')
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 3. Find and click a node to open properties
  console.log('🧪 Clicking first node to open properties panel...')
  const firstNode = page.locator('.react-flow__node').first()
  const nodeExists = await firstNode.isVisible()
  console.log(`   First node visible: ${nodeExists ? '✅' : '❌'}`)

  if (nodeExists) {
    await firstNode.click()
    await page.waitForTimeout(500)
  }

  // 4. Verify properties panel is visible
  console.log('🔍 Verifying properties panel...')
  const propertiesHeader = page.locator('h3').filter({ hasText: 'PROPERTIES' }).first()
  const panelVisible = await propertiesHeader.isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`   Properties panel visible: ${panelVisible ? '✅' : '❌'}`)

  // 5. Find label input
  console.log('🔍 Finding label input field...')
  const labelInputs = await page.locator('input[type="text"]').all()
  console.log(`   Found ${labelInputs.length} text inputs`)

  // 6. Find description editor
  console.log('🔍 Finding description RichTextEditor...')
  const descriptionEditor = page.locator('[contenteditable="true"]').last()
  const descExists = await descriptionEditor.isVisible({ timeout: 1000 }).catch(() => false)
  console.log(`   Description editor found: ${descExists ? '✅' : '❌'}`)

  if (descExists) {
    console.log('🧪 Typing description...')
    await descriptionEditor.click()
    await page.keyboard.type('This is a test node description', { delay: 30 })
    await page.waitForTimeout(300)
    console.log('   ✅ Description typed')
  }

  // 7. Find image upload area
  console.log('🔍 Finding image upload component...')
  const uploadButton = page.locator('button').filter({ hasText: /upload|image|attachment/i }).first()
  const uploadExists = await uploadButton.isVisible({ timeout: 1000 }).catch(() => false)
  console.log(`   Upload button found: ${uploadExists ? '✅' : '❌'}`)

  // 8. Find delete button
  console.log('🔍 Finding delete button...')
  const deleteButton = page.locator('button').filter({ hasText: 'Delete' }).first()
  const deleteExists = await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)
  console.log(`   Delete button visible: ${deleteExists ? '✅' : '❌'}`)

  // 9. Verify styling consistency
  console.log('🔍 Verifying panel styling...')
  const panelStyle = await page.locator('[style*="flex-direction: column"]').first().evaluate((el) => ({
    display: window.getComputedStyle(el).display,
    flexDirection: window.getComputedStyle(el).flexDirection,
    overflow: window.getComputedStyle(el).overflow,
  }))
  console.log(`   Panel style - display: ${panelStyle.display}, flex-direction: ${panelStyle.flexDirection}`)

  // 10. Check for console errors
  console.log('🔍 Checking console...')
  const pageErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      pageErrors.push(msg.text())
    }
  })
  await page.waitForTimeout(500)
  console.log(`   Console errors: ${pageErrors.length > 0 ? pageErrors.join('; ') : '✅ NONE'}`)

  // 11. Screenshot
  console.log('📸 Capturing screenshot...')
  await page.screenshot({ path: 'test-properties-result.png' })
  console.log('   Saved: test-properties-result.png')

  // 12. Report
  const allPassed = panelVisible && descExists && pageErrors.length === 0
  if (allPassed) {
    console.log('✅ Test PASSED - Properties panel with editors working')
  } else {
    console.log('❌ Test FAILED - Properties panel issues detected')
  }

  await browser.close()
})()
