import { test } from '@playwright/test'

test('verify stitch toolbar redesign', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.waitForLoadState('networkidle')
  
  await page.screenshot({
    path: 'test-results/stitch-toolbar-redesigned.png',
    fullPage: false
  })
  
  console.log('✓ Toolbar screenshot taken')
})
