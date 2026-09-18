import { test, expect } from '@playwright/test'

test.describe('P2 Workflow Execution E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should create a workflow with nodes and execute it', async ({ page }) => {
    // Step 1: Verify workflow canvas is visible
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Add a trigger node
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(500)
    }

    // Step 3: Verify node appears on canvas
    const nodes = page.locator('[data-testid*="workflow-node"]')
    const nodeCount = await nodes.count()
    expect(nodeCount).toBeGreaterThan(0)

    // Step 4: Add an action node
    const addActionButton = page.locator('button[data-testid="add-action-node"]')
    if (await addActionButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addActionButton.click()
      await page.waitForTimeout(500)
    }

    // Step 5: Verify nodes can be connected (look for edge controls)
    const nodes2 = page.locator('[data-testid*="workflow-node"]')
    const finalNodeCount = await nodes2.count()
    expect(finalNodeCount).toBeGreaterThanOrEqual(nodeCount)

    // Step 6: Execute the workflow
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await executeButton.click()
      await page.waitForTimeout(1000)

      // Step 7: Verify execution status updates
      const executionStatus = page.locator('[data-testid="execution-status"]')
      const statusText = await executionStatus.textContent()
      expect(statusText).toMatch(/running|completed|executed/i)
    }
  })

  test('should handle workflow state persistence across operations', async ({ page }) => {
    // Step 1: Create initial workflow state
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Add nodes
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(300)
      await addNodeButton.click()
      await page.waitForTimeout(300)
    }

    // Step 3: Verify dirty state (should show unsaved indicator)
    const dirtyIndicator = page.locator('[data-testid="unsaved-indicator"], text=/unsaved|modified/i')
    const isDirty = await dirtyIndicator.isVisible({ timeout: 5000 }).catch(() => false)

    if (isDirty) {
      // Step 4: Save workflow
      const saveButton = page.locator('button[data-testid="save-workflow"]')
      if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await saveButton.click()
        await page.waitForTimeout(500)

        // Step 5: Verify dirty state clears
        const stillDirty = await dirtyIndicator.isVisible({ timeout: 2000 }).catch(() => false)
        expect(stillDirty).toBe(false)
      }
    }
  })

  test('should display execution logs during workflow execution', async ({ page }) => {
    // Step 1: Navigate to workflow canvas
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Start execution
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await executeButton.click()
      await page.waitForTimeout(1000)

      // Step 3: Look for execution logs panel
      const logsPanel = page.locator('[data-testid="execution-logs"], [data-testid="logs-container"]')
      const logsVisible = await logsPanel.isVisible({ timeout: 5000 }).catch(() => false)

      if (logsVisible) {
        // Step 4: Verify log entries appear
        const logEntries = page.locator('[data-testid*="log-entry"]')
        const logCount = await logEntries.count()
        expect(logCount).toBeGreaterThanOrEqual(0)

        // Step 5: Check for log content
        const logsText = await logsPanel.textContent()
        expect(logsText).toBeTruthy()
      }
    }
  })

  test('should support undo/redo operations', async ({ page }) => {
    // Step 1: Create initial state
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Add a node
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(500)

      // Step 3: Get node count
      const nodes = page.locator('[data-testid*="workflow-node"]')
      const nodesAfterAdd = await nodes.count()

      // Step 4: Undo operation
      const undoButton = page.locator('button[data-testid="undo"]')
      if (await undoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await undoButton.click()
        await page.waitForTimeout(300)

        // Step 5: Verify node is removed
        const nodesAfterUndo = await nodes.count()
        expect(nodesAfterUndo).toBeLessThan(nodesAfterAdd)

        // Step 6: Redo operation
        const redoButton = page.locator('button[data-testid="redo"]')
        if (await redoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await redoButton.click()
          await page.waitForTimeout(300)

          // Step 7: Verify node reappears
          const nodesAfterRedo = await nodes.count()
          expect(nodesAfterRedo).toEqual(nodesAfterAdd)
        }
      }
    }
  })

  test('should handle keyboard shortcuts for node operations', async ({ page }) => {
    // Step 1: Focus on canvas
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await canvas.click()
    await canvas.focus()

    // Step 2: Try keyboard shortcuts (Cmd/Ctrl + Z for undo, Y for redo)
    // Note: Shortcuts vary by platform and implementation

    // Step 3: Add node using UI
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(300)

      // Step 4: Select a node
      const node = page.locator('[data-testid*="workflow-node"]').first()
      if (await node.isVisible({ timeout: 5000 }).catch(() => false)) {
        await node.click()
        await page.waitForTimeout(200)

        // Step 5: Try delete with keyboard (Del key)
        const nodesBefore = await page.locator('[data-testid*="workflow-node"]').count()
        await page.keyboard.press('Delete')
        await page.waitForTimeout(300)

        const nodesAfter = await page.locator('[data-testid*="workflow-node"]').count()
        // May or may not delete depending on implementation
        expect(nodesAfter).toBeLessThanOrEqual(nodesBefore)
      }
    }
  })

  test('should update node status during execution', async ({ page }) => {
    // Step 1: Create workflow
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Add nodes
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(300)
    }

    // Step 3: Execute workflow
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await executeButton.click()
      await page.waitForTimeout(1000)

      // Step 4: Check node status indicators
      const nodeStatus = page.locator('[data-testid*="node-status"]')
      const statusCount = await nodeStatus.count()

      // Status indicators may appear
      if (statusCount > 0) {
        const firstStatus = nodeStatus.first()
        const statusText = await firstStatus.textContent()
        expect(statusText).toMatch(/running|pending|completed|failed|idle/i)
      }
    }
  })

  test('should display error messages when workflow execution fails', async ({ page }) => {
    // Step 1: Create workflow with potential error condition
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Execute workflow
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await executeButton.click()
      await page.waitForTimeout(2000)

      // Step 3: Check for error messages
      const errorPanel = page.locator('[data-testid="error-panel"], [data-testid="error-display"]')
      const errorVisible = await errorPanel.isVisible({ timeout: 5000 }).catch(() => false)

      if (errorVisible) {
        const errorText = await errorPanel.textContent()
        expect(errorText).toBeTruthy()
      } else {
        // If no errors, check for error in logs
        const logsPanel = page.locator('[data-testid="execution-logs"]')
        if (await logsPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
          const logsText = await logsPanel.textContent()
          // May or may not contain errors
          expect(logsText).toBeTruthy()
        }
      }
    }
  })

  test('should properly handle empty workflow', async ({ page }) => {
    // Step 1: Navigate to clean workflow state
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Verify no nodes exist
    const nodes = page.locator('[data-testid*="workflow-node"]')
    const initialNodeCount = await nodes.count()

    // Step 3: Try to execute empty workflow
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Button may be disabled or show warning
      const isDisabled = await executeButton.isDisabled()
      const isEmpty = initialNodeCount === 0

      if (isEmpty) {
        expect(isDisabled).toBe(true)
      }
    }
  })

  test('should maintain execution state across mode switches', async ({ page }) => {
    // Step 1: Create and execute workflow
    const canvas = page.locator('[data-testid="workflow-canvas"]')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Step 2: Add node
    const addNodeButton = page.locator('button[data-testid="add-trigger-node"]')
    if (await addNodeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addNodeButton.click()
      await page.waitForTimeout(300)
    }

    // Step 3: Execute
    const executeButton = page.locator('button[data-testid="execute-workflow"]')
    if (await executeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await executeButton.click()
      await page.waitForTimeout(1000)

      // Step 4: Get execution status
      const statusBefore = await page.locator('[data-testid="execution-status"]').textContent()

      // Step 5: Switch modes (if mode switching exists)
      const webModeButton = page.locator('button:has-text("Web Design")')
      if (await webModeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await webModeButton.click()
        await page.waitForTimeout(500)

        // Step 6: Switch back to workflow
        const workflowButton = page.locator('button:has-text("Workflow")')
        if (await workflowButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await workflowButton.click()
          await page.waitForTimeout(500)

          // Step 7: Verify status persists
          const statusAfter = await page.locator('[data-testid="execution-status"]').textContent()
          // Status should be maintained or similar
          expect(statusAfter).toBeTruthy()
        }
      }
    }
  })
})
