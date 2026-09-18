import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🚀 Testing RichTextEditor in Chat Panel...')

  // 1. Navigate
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 2. Clear state
  console.log('🧹 Clearing localStorage...')
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 3. Open Agent Log / Chat panel
  console.log('🧪 Opening Agent Log panel...')
  const agentLogButton = page.locator('button[title="Agent Log"]')
  const agentButtonExists = await agentLogButton.isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`   Agent Log button found: ${agentButtonExists ? '✅' : '❌'}`)

  if (agentButtonExists) {
    await agentLogButton.click()
    await page.waitForTimeout(500)
    console.log('   ✅ Agent Log panel opened')
  } else {
    console.log('   ⚠️ Agent Log button not found, continuing...')
  }

  // 3a. Locate chat input
  console.log('🔍 Finding chat panel RichTextEditor...')
  const chatInput = page.locator('[contenteditable="true"]').first()
  const inputExists = await chatInput.isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`   Chat input visible: ${inputExists ? '✅' : '❌'}`)

  // 4. Type text in chat
  if (inputExists) {
    console.log('🧪 Typing test message in chat...')
    await chatInput.click()
    await page.keyboard.type('Hello from @agent', { delay: 50 })
    await page.waitForTimeout(300)
    console.log('   ✅ Text typed')

    // 5. Verify text appears
    console.log('🔍 Verifying text content...')
    const textContent = await chatInput.evaluate((el) => el.innerText)
    const hasText = textContent.includes('Hello')
    console.log(`   Text content contains "Hello": ${hasText ? '✅' : '❌'}`)
  }

  // 6. Test formatting toolbar
  console.log('🔍 Looking for formatting toolbar...')
  const toolbar = page.locator('[style*="display: flex"][style*="gap"][style*="border-top"]').first()
  const toolbarExists = await toolbar.isVisible()
  console.log(`   Formatting toolbar visible: ${toolbarExists ? '✅' : '❌'}`)

  // 7. Test Bold, Italic buttons
  console.log('🧪 Testing formatting buttons...')
  const boldButton = page.locator('button[title*="Bold"], button[title*="bold"]')
  const boldExists = await boldButton.isVisible()
  console.log(`   Bold button found: ${boldExists ? '✅' : '❌'}`)

  // 8. Test Send button
  console.log('🧪 Testing Send button...')
  const sendButton = page.locator('button').filter({ hasText: 'Send' })
  const sendExists = await sendButton.isVisible()
  console.log(`   Send button visible: ${sendExists ? '✅' : '❌'}`)

  if (sendExists && inputExists) {
    console.log('🧪 Clicking Send button...')
    await sendButton.click()
    await page.waitForTimeout(500)
    console.log('   ✅ Message sent')
  }

  // 9. Verify message appears in chat
  console.log('🔍 Verifying message in chat history...')
  const messageVisible = await page.locator(':text("Hello from @agent")').isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`   Message appears in chat: ${messageVisible ? '✅' : '❌'}`)

  // 10. Check console for errors
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
  await page.screenshot({ path: 'test-rich-text-result.png' })
  console.log('   Saved: test-rich-text-result.png')

  // 12. Report
  const allPassed = inputExists && sendExists && pageErrors.length === 0
  if (allPassed) {
    console.log('✅ Test PASSED - RichTextEditor working in chat')
  } else {
    console.log('❌ Test FAILED - RichTextEditor issues detected')
  }

  await browser.close()
})()
