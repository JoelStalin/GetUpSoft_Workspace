'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useExecutionStatus } from './useExecutionStatus'
import { useToast } from '../contexts/ToastContext'
import { ExecutionLog } from '../types/execution'
import { getApiUrl } from '../config/runtime'

/**
 * Hook for tracking workflow execution with real-time updates
 * Handles SSE streaming, fallback simulation, and status updates
 */
export function useExecutionTracking() {
  const { addLog, updateLog, setIsExecuting, currentExecutionId } = useExecutionStatus()
  const { addToast } = useToast()
  const eventSourceRef = useRef<EventSource | null>(null)
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to execution stream when execution ID is set
  useEffect(() => {
    if (!currentExecutionId) {
      return
    }

    connectToStream(currentExecutionId)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current)
      }
    }
  }, [currentExecutionId])

  const connectToStream = (executionId: string) => {
    // Close previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(getApiUrl(`/api/n8n/executions/${executionId}/stream`))

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'node-start' || data.type === 'execution-node-start') {
            addLog({
              nodeId: data.nodeId || data.node_id,
              status: 'running',
              message: `Executing ${data.nodeId || data.node_id}`,
              timestamp: new Date().toISOString(),
            } as ExecutionLog)
          } else if (data.type === 'node-complete' || data.type === 'execution-node-complete') {
            updateLog(data.nodeId || data.node_id, {
              status: 'completed',
              output: data.output,
              duration: data.duration,
              timestamp: new Date().toISOString(),
            })
          } else if (data.type === 'node-error' || data.type === 'execution-node-error') {
            updateLog(data.nodeId || data.node_id, {
              status: 'failed',
              error: data.error || data.message,
              timestamp: new Date().toISOString(),
            })
          } else if (data.type === 'execution-complete' || data.status === 'done') {
            setIsExecuting(false)
            addToast('Workflow execution completed', 'success')
            eventSource.close()
          } else if (data.type === 'execution-failed') {
            setIsExecuting(false)
            addToast('Workflow execution failed', 'error')
            eventSource.close()
          }
        } catch (e) {
          console.error('Failed to parse execution event:', e)
        }
      }

      eventSource.onerror = () => {
        console.warn('SSE connection error, closing stream')
        eventSource.close()
        setIsExecuting(false)
      }

      eventSourceRef.current = eventSource

      // Timeout after 5 minutes
      executionTimeoutRef.current = setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          setIsExecuting(false)
          addToast('Execution timeout', 'warning')
        }
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error('Failed to connect to execution stream:', error)
      addToast('Failed to connect to execution stream', 'error')
      setIsExecuting(false)
    }
  }

  // Manual log update for testing or API fallback
  const logNodeExecution = useCallback(
    (nodeId: string, status: 'pending' | 'running' | 'completed' | 'failed', details?: Partial<ExecutionLog>) => {
      if (status === 'running') {
        addLog({
          nodeId,
          status,
          message: `Executing ${nodeId}`,
          timestamp: new Date().toISOString(),
          ...details,
        } as ExecutionLog)
      } else {
        updateLog(nodeId, {
          status,
          timestamp: new Date().toISOString(),
          ...details,
        })
      }
    },
    [addLog, updateLog]
  )

  const stopExecution = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current)
    }
    setIsExecuting(false)
  }, [setIsExecuting])

  return {
    logNodeExecution,
    stopExecution,
    connectToStream,
  }
}
