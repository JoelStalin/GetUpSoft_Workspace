import { useRef, useEffect, useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { getApiUrl } from '../config/runtime'

interface ExecutionLog {
  timestamp?: string
  status?: string
  node_name?: string
  node_id?: string
  message?: string
  error?: string
  execution_id?: string
  workflow_id?: string
  [key: string]: any
}

export default function ExecutionViewer() {
  const [sseExecutionId, setSseExecutionId] = useState<string | null>(null)
  const [sseLogs, setSseLogs] = useState<ExecutionLog[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const executionLogs = useWorkflowStore((state) => state.executionLogs)
  const clearLogs = useWorkflowStore((state) => state.clearExecutionLogs)
  const currentExecutionId = useWorkflowStore((state) => state.currentExecutionId)
  const setCurrentExecutionId = useWorkflowStore((state) => state.setCurrentExecutionId)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sseLogs, executionLogs])

  // Connect to SSE stream when execution ID changes
  useEffect(() => {
    if (currentExecutionId && currentExecutionId !== sseExecutionId) {
      connectToExecutionStream(currentExecutionId)
    }
  }, [currentExecutionId])

  const connectToExecutionStream = (execId: string) => {
    setSseExecutionId(execId)
    setSseLogs([])
    setIsStreaming(true)

    // Close previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(getApiUrl(`/api/n8n/executions/${execId}/stream`))

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
        console.error('Failed to parse SSE message:', e)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
      setIsStreaming(false)
    }

    eventSourceRef.current = eventSource
  }

  const handleClear = () => {
    setSseLogs([])
    clearLogs()
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setIsStreaming(false)
    }
    setCurrentExecutionId(null)
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

  const displayLogs = sseLogs.length > 0 ? sseLogs : executionLogs
  const logCount = displayLogs.length

  return (
    <div className="flex flex-col h-32 bg-[#0d0d0f]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm uppercase text-gray-400">
            Execution Logs {logCount > 0 && `(${logCount})`}
          </h3>
          {isStreaming && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
        </div>
        {logCount > 0 && (
          <button onClick={handleClear} className="text-xs text-gray-500 hover:text-gray-300">
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
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
                <span className={`${getStatusColor(log.status || 'pending')} w-20 flex-shrink-0`}>
                  [{(log.status || 'pending').toUpperCase()}]
                </span>
                <span className="text-gray-300 break-all">
                  {log.node_name || log.message || log.error || 'Update'}
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
