import { test } from '@playwright/test'

test('verify stitch layout redesign', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.waitForLoadState('networkidle')
  
  // Wait for nodes to render
  await page.waitForSelector('.react-flow__node', { timeout: 5000 })
  
  await page.screenshot({
    path: 'test-results/stitch-layout-complete.png',
    fullPage: false
  })
  
  console.log('✓ Layout screenshot taken')
})
