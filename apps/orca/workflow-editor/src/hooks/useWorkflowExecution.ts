import { useCallback, useRef } from 'react'
import { useExecutionOperations } from './useWorkflowOperations'

interface ExecutionStep {
  nodeId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  error?: string
  duration?: number
}

/**
 * MIGRATED: Now uses P2 hooks (useExecutionOperations)
 */
export function useWorkflowExecution() {
  const { addLog } = useExecutionOperations()
  const executionRef = useRef<NodeJS.Timeout | null>(null)

  const simulateExecution = useCallback(
    async (nodeIds: string[], options: { delayBetweenNodes?: number } = {}) => {
      const { delayBetweenNodes = 1500 } = options

      // Clear previous execution logs
      for (const nodeId of nodeIds) {
        addLog({
          nodeId,
          status: 'pending',
          timestamp: new Date().toISOString(),
        })
      }

      // Simulate execution
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i]

        // Running state
        addLog({
          nodeId,
          status: 'running',
          message: `Executing node ${i + 1}/${nodeIds.length}`,
          timestamp: new Date().toISOString(),
        })

        // Wait before completing
        await new Promise(resolve => {
          executionRef.current = setTimeout(resolve, delayBetweenNodes)
        })

        // Random success/failure for demo
        const isSuccess = Math.random() > 0.1 // 90% success rate

        if (isSuccess) {
          addLog({
            nodeId,
            status: 'completed',
            message: `Node ${i + 1} completed successfully`,
            timestamp: new Date().toISOString(),
            duration: delayBetweenNodes,
          })
        } else {
          addLog({
            nodeId,
            status: 'failed',
            error: 'Execution failed: Connection timeout',
            timestamp: new Date().toISOString(),
            duration: delayBetweenNodes,
          })
          break // Stop on error
        }
      }
    },
    [addLog]
  )

  const stopExecution = useCallback(() => {
    if (executionRef.current) {
      clearTimeout(executionRef.current)
    }
  }, [])

  return {
    simulateExecution,
    stopExecution,
  }
}
