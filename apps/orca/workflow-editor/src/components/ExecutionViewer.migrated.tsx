import { useRef, useEffect, useState } from 'react'
import { useExecutionStatus, useExecutionOperations } from '../hooks/useWorkflowOperations'
import { useErrorRecovery } from '../hooks/useWorkflowOperations'
import { ExecutionLog } from '../types/execution'

/**
 * ExecutionViewer - MIGRATED TO P2 HOOKS
 * Uses new ExecutionContext instead of workflowStore
 * 
 * Migration changes:
 * - useWorkflowStore → useExecutionStatus, useExecutionOperations, useErrorRecovery
 * - executionLogs → logs from useExecutionStatus
 * - clearLogs → resetExecution from useExecutionOperations
 * - currentExecutionId → handled via execution events
 * - setCurrentExecutionId → startExecution from useExecutionOperations
 */
export default function ExecutionViewerMigrated() {
  const [sseExecutionId, setSseExecutionId] = useState<string | null>(null)
  const [sseLogs, setSseLogs] = useState<ExecutionLog[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const executionState = useExecutionStatus()
  const { logs: contextLogs } = executionState
  const { resetExecution } = useExecutionOperations()
  const { addError } = useErrorRecovery()

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sseLogs, contextLogs])

  // Connect to SSE stream when execution starts
  useEffect(() => {
    if (executionState.status === 'running' && !sseExecutionId) {
      const execId = executionState.currentNodeId || 'current'
      connectToExecutionStream(execId)
    }
  }, [executionState.status])

  const connectToExecutionStream = (execId: string) => {
    setSseExecutionId(execId)
    setSseLogs([])
    setIsStreaming(true)

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(`/api/n8n/executions/${execId}/stream`)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.status === 'done') {
            eventSource.close()
            setIsStreaming(false)
            return
          }

          setSseLogs((prev) => [...prev, data])
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Failed to parse SSE message')
          addError(error, 'ExecutionViewer.SSE', 2)
          console.error('Failed to parse SSE message:', e)
        }
      }

      eventSource.onerror = () => {
        const error = new Error('SSE connection error')
        addError(error, 'ExecutionViewer.SSE', 3)
        console.error('SSE connection error')
        eventSource.close()
        setIsStreaming(false)
      }

      eventSourceRef.current = eventSource
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to connect to execution stream')
      addError(error, 'ExecutionViewer.Stream', 2)
    }
  }

  const handleClear = () => {
    setSseLogs([])
    resetExecution()
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setIsStreaming(false)
    }
    setSseExecutionId(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-400'
      case 'completed':
        return 'text-green-400'
      case 'failed':
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  // Display SSE logs if streaming, otherwise use context logs
  const displayLogs = sseLogs.length > 0 ? sseLogs : contextLogs
  const logCount = displayLogs.length

  return (
    <div className="flex flex-col h-32 bg-[#0d0d0f]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm uppercase text-gray-400">
            Execution Logs {logCount > 0 && `(${logCount})`}
          </h3>
          {isStreaming && (
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          )}
          {executionState.status === 'running' && (
            <span className="text-xs text-blue-400">
              Progress: {Math.round(executionState.progress)}%
            </span>
          )}
        </div>
        {logCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {logCount === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No logs yet. Run a workflow to see execution details.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displayLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-gray-600 w-24 flex-shrink-0">
                  {log.startTime ? new Date(log.startTime).toLocaleTimeString() : 'N/A'}
                </span>
                <span className={`${getStatusColor(log.status || 'pending')} w-20 flex-shrink-0`}>
                  [{(log.status || 'pending').toUpperCase()}]
                </span>
                <span className="text-gray-300 break-all">
                  {log.nodeName || log.message || log.error?.message || 'Update'}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}
