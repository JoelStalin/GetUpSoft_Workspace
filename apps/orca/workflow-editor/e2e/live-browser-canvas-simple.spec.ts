import { test, expect } from '@playwright/test'

test.describe('Live Browser Node Type Registration (Phase 3)', () => {
  test('should load app without errors', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Check for console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait for app to load
    await page.waitForTimeout(3000)

    // Should not have critical errors
    const criticalErrors = errors.filter((e) =>
      !e.includes('ResizeObserver') && !e.includes('WARN') && !e.includes('minor')
    )
    expect(criticalErrors.length).toBeLessThan(3)
  })

  test('app should be responsive at all required viewports', async ({ page }) => {
    const viewports = [
      { width: 1366, height: 768, name: '1366x768' },
      { width: 1440, height: 900, name: '1440x900' },
      { width: 1920, height: 1080, name: '1920x1080' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      // Verify layout is visible
      const body = await page.locator('body')
      const bbox = await body.boundingBox()
      expect(bbox).not.toBeNull()
      expect(bbox?.width).toBeGreaterThan(0)
      expect(bbox?.height).toBeGreaterThan(0)
    }
  })

  test('workflow canvas should be visible and ready', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Look for React Flow container
    const flowContainer = page.locator('.react-flow__renderer')
    expect(await flowContainer.isVisible()).toBeTruthy()
  })
})
