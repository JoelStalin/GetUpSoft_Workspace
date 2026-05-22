import { test } from '@playwright/test'

test('verify stitch color palette applied', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.waitForLoadState('networkidle')
  
  // Take screenshot of the new color scheme
  await page.screenshot({ 
    path: 'test-results/stitch-colors-applied.png',
    fullPage: false
  })
  
  console.log('✓ Screenshot taken: stitch-colors-applied.png')
})
