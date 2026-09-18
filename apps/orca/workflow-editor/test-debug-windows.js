import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🚀 Debugging floating windows...')
  await page.goto('http://localhost:5182', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  console.log('📸 Taking initial screenshot...')
  await page.screenshot({ path: 'debug-initial.png' })

  // List visible text on page
  console.log('🔍 Finding all visible text...')
  const allText = await page.evaluate(() => document.body.innerText)
  console.log('Page text (first 500 chars):')
  console.log(allText.substring(0, 500))

  // Look for chat panel header
  const agentLog = await page.locator(':text("Agent Log")').isVisible({ timeout: 1000 }).catch(() => false)
  console.log(`Agent Log header visible: ${agentLog ? '✅' : '❌'}`)

  // Look for components panel
  const components = await page.locator('h3:has-text("COMPONENTS")').isVisible({ timeout: 1000 }).catch(() => false)
  console.log(`Components panel visible: ${components ? '✅' : '❌'}`)

  // Look for rich text editor in chat
  const contentEditable = await page.locator('[contenteditable="true"]').count()
  console.log(`Found ${contentEditable} contenteditable elements`)

  await browser.close()
})()
