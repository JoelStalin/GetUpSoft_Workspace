import { useMemo } from 'react'
import { useExecutionStatus } from '../hooks/useWorkflowOperations'
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'

/**
 * MIGRATED: Now uses P2 hooks (useExecutionStatus)
 */
export default function ExecutionTimeline() {
  const executionState = useExecutionStatus()
  const executionLogs = executionState.logs

  const stats = useMemo(() => {
    if (!executionLogs || executionLogs.length === 0) {
      return { total: 0, completed: 0, failed: 0, running: 0 }
    }

    const completed = executionLogs.filter(l => l.status === 'completed').length
    const failed = executionLogs.filter(l => l.status === 'failed').length
    const running = executionLogs.filter(l => l.status === 'running').length
    const totalDuration = executionLogs
      .filter(l => l.duration)
      .reduce((sum, l) => sum + (l.duration || 0), 0)

    return {
      total: executionLogs.length,
      completed,
      failed,
      running,
      totalDuration,
    }
  }, [executionLogs])

  if (!executionLogs || executionLogs.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No execution logs yet</p>
        <p className="text-xs text-gray-500 mt-1">Run a workflow to see execution timeline</p>
      </div>
    )
  }

  const sortedLogs = [...executionLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime()
    const timeB = new Date(b.timestamp || 0).getTime()
    return timeA - timeB
  })

  return (
    <div className="flex flex-col gap-0 p-0 h-full">
      {/* Stats Header */}
      <div
        className="flex gap-4 px-4 py-2 border-b text-xs font-semibold"
        style={{
          backgroundColor: 'rgb(var(--color-base-300))',
          borderColor: 'rgb(var(--color-base-400))',
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Total:</span>
          <span className="text-gray-300">{stats.total}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" />
          <span className="text-gray-300">{stats.completed}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle size={12} className="text-red-500" />
          <span className="text-gray-300">{stats.failed}</span>
        </div>
        {stats.running > 0 && (
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-yellow-500" />
            <span className="text-gray-300">{stats.running}</span>
          </div>
        )}
        {stats.totalDuration > 0 && (
          <div className="ml-auto text-gray-400">
            {(stats.totalDuration / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {sortedLogs.map((log, index) => {
          const statusColor = {
            completed: 'text-green-500',
            failed: 'text-red-500',
            running: 'text-yellow-500',
            pending: 'text-gray-500',
          }[log.status] || 'text-gray-400'

          const Icon = log.status === 'completed'
            ? CheckCircle
            : log.status === 'failed'
            ? AlertCircle
            : log.status === 'running'
            ? Zap
            : Clock

          return (
            <div key={`${log.nodeId}-${index}`} className="flex gap-2 text-xs pb-2 border-b border-gray-700 last:border-0">
              <Icon size={14} className={`flex-shrink-0 mt-0.5 ${statusColor}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-300">
                  {log.nodeId || `Node ${index + 1}`}
                </div>
                {log.message && (
                  <div className="text-xs text-gray-400 truncate">{log.message}</div>
                )}
                {log.error && (
                  <div className="text-xs text-red-400 truncate">{log.error.message}</div>
                )}
                <div className="text-xs text-gray-500 flex gap-2">
                  {log.timestamp && (
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  )}
                  {log.duration && (
                    <span>{(log.duration / 1000).toFixed(2)}s</span>
                  )}
                </div>
              </div>
              <span className={`text-xs font-semibold capitalize whitespace-nowrap ${statusColor}`}>
                {log.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
