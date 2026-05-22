import { useExecutionStatus } from '../hooks/useExecutionStatus'
import { CheckCircle, AlertCircle, Clock, Zap, X } from 'lucide-react'

/**
 * Compact execution status bar for toolbar
 * Shows real-time execution progress and stats
 */
export default function ExecutionStatusBar() {
  const { isExecuting, logs } = useExecutionStatus()

  if (!isExecuting && logs.length === 0) {
    return null
  }

  const completed = logs.filter(l => l.status === 'completed').length
  const failed = logs.filter(l => l.status === 'failed').length
  const running = logs.filter(l => l.status === 'running').length
  const total = logs.length

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 12px',
        backgroundColor: 'rgba(var(--color-primary-400), 0.1)',
        border: '1px solid var(--stitch-border)',
        borderRadius: '4px',
        fontSize: '12px',
        minWidth: '250px',
      }}
    >
      {/* Progress Bar */}
      {isExecuting && (
        <div
          style={{
            width: '80px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'rgb(var(--color-primary-400))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Status Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {running > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: 'rgb(255, 193, 7)',
            }}
          >
            <Zap size={12} />
            <span>{running}</span>
          </div>
        )}

        {completed > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: 'rgb(15, 163, 136)',
            }}
          >
            <CheckCircle size={12} />
            <span>{completed}</span>
          </div>
        )}

        {failed > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: 'rgb(237, 49, 93)',
            }}
          >
            <AlertCircle size={12} />
            <span>{failed}</span>
          </div>
        )}
      </div>

      {/* Progress Text */}
      <span style={{ color: 'var(--stitch-muted)', marginLeft: 'auto' }}>
        {progress}%
      </span>
    </div>
  )
}
