import { Handle, Position } from '@xyflow/react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useExecutionStatus } from '../hooks/useExecutionStatus'
import { getNodeIcon } from '../utils/nodeIcons'

const statusColors = {
  running: 'rgb(255 193 7)',  // Amber
  completed: 'rgb(15 163 136)',  // Green from design system
  failed: 'rgb(237 49 93)',  // Red from design system
  pending: 'rgb(116 114 114)',  // Muted gray
}

export default function OrcaNode({ data, id, selected, isConnecting }: any) {
  const { selectNode } = useWorkflowOperations()
  const { getNodeLog } = useExecutionStatus()

  const nodeLog = getNodeLog(id)
  const nodeStatus = nodeLog?.status || 'pending'
  const errorMessage = nodeLog?.error || nodeLog?.message

  const statusColor = statusColors[nodeStatus as keyof typeof statusColors] || statusColors.pending
  const isRunning = nodeStatus === 'running'
  const isFailed = nodeStatus === 'failed'
  const isCompleted = nodeStatus === 'completed'
  const IconComponent = getNodeIcon(data.type)

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        px-0 py-0 rounded-lg border-2 transition cursor-pointer
        hover:opacity-90 relative w-56 group shadow-lg
        ${selected
          ? 'border-[rgb(var(--color-primary-400))] shadow-2xl'
          : 'border-[rgba(100,100,120,0.5)] hover:border-[rgba(124,77,255,0.5)]'
        }
        ${isRunning ? 'node-running' : ''}
        ${isFailed ? 'border-[rgb(237_49_93)]' : ''}
        ${isCompleted ? 'border-[rgb(15_163_136)]' : ''}
      `}
      style={{
        backgroundColor: '#1f2340',
        borderLeftColor: data.color || 'rgb(var(--color-primary-400))',
        borderLeftWidth: '5px',
        boxShadow: selected
          ? '0 8px 24px rgba(124, 77, 255, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.6)',
      }}
      title={errorMessage || undefined}
    >
      {/* Status Badge */}
      <div
        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-[#0a0e27] ${
          isRunning ? 'status-badge-running' : ''
        }`}
        style={{
          backgroundColor: statusColor,
        }}
      />

      {/* Error Tooltip */}
      {errorMessage && (
        <div className="absolute -top-10 left-0 hidden group-hover:block bg-[rgb(237_49_93)] text-white text-xs px-2 py-1 rounded z-10 w-48 break-words">
          {errorMessage}
        </div>
      )}

      {/* Content */}
      <div className="flex gap-3 p-3">
        {/* Icon Box */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 relative"
          style={{
            backgroundColor: `${data.color || 'rgb(var(--color-primary-400))'}20`,
          }}
        >
          {IconComponent && (
            <IconComponent
              size={20}
              style={{ color: data.color || 'rgb(var(--color-primary-400))' }}
            />
          )}
          {isRunning && (
            <div className="absolute inset-0 rounded-lg animate-pulse" style={{
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
            }} />
          )}
        </div>

        {/* Label and Type */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="font-medium text-[rgb(var(--color-base-700))] text-sm truncate">
            {data.label}
          </div>
          <div className="flex justify-between items-baseline gap-2">
            {data.type && (
              <div className="text-xs text-[rgba(var(--color-base-400))] truncate">
                {data.type.split('.').pop()}
              </div>
            )}
            {nodeStatus !== 'pending' && (
              <div className="text-xs font-semibold capitalize" style={{ color: statusColor }}>
                {nodeStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={!isConnecting}
        style={{
          backgroundColor: data.color || '#7c4dff',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={!isConnecting}
        style={{
          backgroundColor: data.color || '#7c4dff',
        }}
      />
    </div>
  )
}
