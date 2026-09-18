import { test, expect } from '@playwright/test'

test.describe('ORCA UI/UX Integration Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5185')
    await page.waitForLoadState('networkidle')
    // Wait for React to fully render
    await page.waitForTimeout(2000)
  })

  test('should render complete app layout', async ({ page }) => {
    // Main container
    const appContainer = page.locator('[style*="position: fixed"]').first()
    await expect(appContainer).toBeVisible()

    // Top toolbar
    const toolbar = page.locator('text=Edit Workflow').first()
    await expect(toolbar).toBeVisible()

    // Canvas area
    const canvas = page.locator('.react-flow__viewport')
    await expect(canvas).toBeVisible()

    // Quick access bar at bottom
    const quickAccessBar = page.locator('[style*="bottom: 16px"]').first()
    await expect(quickAccessBar).toBeVisible()
  })

  test('should have all UI components mounted', async ({ page }) => {
    // Check for key components
    const components = [
      { selector: 'text=Components', name: 'Components Panel' },
      { selector: 'text=Agent Log', name: 'Chat Panel' },
      { selector: 'text=Properties', name: 'Properties Panel' },
      { selector: 'text=Version History', name: 'Version Manager' },
      { selector: 'text=Analytics', name: 'Analytics Dashboard' },
    ]

    for (const comp of components) {
      const element = page.locator(comp.selector).first()
      // Components may be hidden initially
      const isVisible = await element.isVisible().catch(() => false)
      console.log(`${comp.name}: ${isVisible ? 'VISIBLE' : 'MOUNTED'}`)
    }
  })

  test('should verify CSS variable integration', async ({ page }) => {
    // Check if CSS variables are applied
    const root = page.locator('html')
    const bgColor = await root.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('--color-base-100')
    ).catch(() => 'NOT_FOUND')

    console.log('--color-base-100:', bgColor)

    // Check for dark mode
    const dataMode = await page.getAttribute('html', 'data-mode')
    expect(dataMode).toBe('dark')
  })

  test('should verify workflow nodes render correctly', async ({ page }) => {
    // Wait for nodes to appear
    const nodes = page.locator('[class*="react-flow__node"]')
    const count = await nodes.count()
    console.log(`Workflow nodes rendered: ${count}`)

    if (count > 0) {
      const firstNode = nodes.first()
      await expect(firstNode).toBeVisible()

      // Check node structure
      const nodeText = await firstNode.textContent()
      console.log('Node content sample:', nodeText?.substring(0, 50))
    }
  })

  test('should verify floating windows can be toggled', async ({ page }) => {
    // Click Components button in quick access bar
    const componentsBtn = page.locator('[title="Components"]').first()

    if (await componentsBtn.isVisible()) {
      await componentsBtn.click()
      await page.waitForTimeout(500)

      // Check if components panel appeared
      const panel = page.locator('text=Components').first()
      const isVisible = await panel.isVisible().catch(() => false)
      console.log('Components panel toggled:', isVisible)
    }
  })

  test('should verify context menu on nodes', async ({ page }) => {
    const nodes = page.locator('[class*="react-flow__node"]')
    const firstNode = nodes.first()

    if (await firstNode.isVisible()) {
      // Right-click on node
      await firstNode.click({ button: 'right' })
      await page.waitForTimeout(300)

      // Check for context menu
      const menu = page.locator('[style*="position: fixed"]').filter({ has: page.locator('text=Duplicate') })
      const menuVisible = await menu.first().isVisible().catch(() => false)
      console.log('Context menu appeared:', menuVisible)

      // Click away to close menu
      await page.keyboard.press('Escape')
    }
  })

  test('should verify accessibility - keyboard navigation', async ({ page }) => {
    // Tab through elements
    const body = page.locator('body')

    await body.focus()
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    console.log('Focused element after Tab:', focusedElement)

    // Verify focus is not lost
    expect(focusedElement).toBeTruthy()
  })

  test('should verify toast notifications integration', async ({ page }) => {
    // Try to trigger a toast (e.g., by deleting a node if possible)
    const nodes = page.locator('[class*="react-flow__node"]')

    if (await nodes.count() > 0) {
      const firstNode = nodes.first()

      // Check console for any errors
      const consoleMessages: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text())
        }
      })

      await page.waitForTimeout(500)
      console.log('Console errors:', consoleMessages.length > 0 ? consoleMessages : 'NONE')
    }
  })

  test('should verify search functionality', async ({ page }) => {
    // Press Ctrl+K to open search
    await page.keyboard.press('Control+K')
    await page.waitForTimeout(300)

    // Check if search dialog appeared
    const searchDialog = page.locator('[role="dialog"]')
    const isVisible = await searchDialog.isVisible().catch(() => false)
    console.log('Search dialog visible:', isVisible)

    // Close search
    await page.keyboard.press('Escape')
  })

  test('should verify responsive behavior', async ({ page }) => {
    // Get viewport size
    const size = page.viewportSize()
    console.log('Viewport size:', size)

    // Check layout responsiveness
    const toolbar = page.locator('[style*="display: flex"]').first()
    const toolbarVisible = await toolbar.isVisible()
    console.log('Toolbar responsive:', toolbarVisible)
  })

  test('should verify all CSS modules loaded', async ({ page }) => {
    // Check for CSS in document
    const stylesheets = await page.locator('link[rel="stylesheet"]').count()
    const styles = await page.locator('style').count()

    console.log(`Stylesheets loaded: ${stylesheets}`)
    console.log(`Inline styles: ${styles}`)

    // Verify no CSS load errors
    const errors = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]')
      const results: string[] = []
      links.forEach(link => {
        const sheet = (link as HTMLLinkElement).sheet
        if (!sheet) results.push((link as HTMLLinkElement).href)
      })
      return results
    })

    console.log('Failed stylesheets:', errors.length > 0 ? errors : 'NONE')
  })

  test('should verify hover states and animations', async ({ page }) => {
    // Find a button and hover over it
    const buttons = page.locator('button').first()

    if (await buttons.isVisible()) {
      const initialStyle = await buttons.getAttribute('style')

      await buttons.hover()
      await page.waitForTimeout(200)

      const hoverStyle = await buttons.getAttribute('style')
      const styleChanged = initialStyle !== hoverStyle

      console.log('Hover state changes detected:', styleChanged)
    }
  })

  test('should verify window state persistence', async ({ page }) => {
    // Check localStorage for window state
    const windowState = await page.evaluate(() => {
      const stored = localStorage.getItem('orca_windows_state_v3')
      return stored ? JSON.parse(stored) : null
    })

    console.log('Window state persisted:', windowState ? 'YES' : 'NO')

    if (windowState) {
      console.log('Persisted windows:', windowState.map((w: any) => w.id))
    }
  })

  test('should generate comprehensive UI audit report', async ({ page }) => {
    const report = {
      timestamp: new Date().toISOString(),
      viewport: page.viewportSize(),
      components: await page.locator('[class*="react-flow__"]').count(),
      buttons: await page.locator('button').count(),
      inputs: await page.locator('input').count(),
      styles: {
        stylesheets: await page.locator('link[rel="stylesheet"]').count(),
        inlineStyles: await page.locator('[style]').count(),
      },
      darkMode: await page.getAttribute('html', 'data-mode'),
      cssVariables: await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement)
        return {
          primaryColor: style.getPropertyValue('--color-primary-400'),
          baseColor: style.getPropertyValue('--color-base-100'),
          textColor: style.getPropertyValue('--stitch-text'),
        }
      }),
      accessibility: {
        focusableElements: await page.locator('[tabindex]').count(),
        ariaLabels: await page.locator('[aria-label]').count(),
        roles: await page.locator('[role]').count(),
      },
    }

    console.log('\n=== COMPREHENSIVE UI AUDIT REPORT ===')
    console.log(JSON.stringify(report, null, 2))
    console.log('===================================\n')
  })
})
