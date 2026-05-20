import { useRef, useEffect } from 'react'
import { useWorkflowStore } from '../store/workflowStore'

export default function ExecutionViewer() {
  const executionLogs = useWorkflowStore((state) => state.executionLogs)
  const clearLogs = useWorkflowStore((state) => state.clearExecutionLogs)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [executionLogs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-400'
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="flex flex-col h-32 bg-[#0d0d0f]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 className="font-bold text-sm uppercase text-gray-400">
          Execution Logs {executionLogs.length > 0 && `(${executionLogs.length})`}
        </h3>
        {executionLogs.length > 0 && (
          <button
            onClick={clearLogs}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {executionLogs.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No logs yet. Run a workflow to see execution details.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-gray-600 w-24 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`${getStatusColor(log.status)} w-20 flex-shrink-0`}>
                  [{log.status.toUpperCase()}]
                </span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}
