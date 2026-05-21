import { Handle, Position } from '@xyflow/react'
import { useWorkflowStore } from '../store/workflowStore'
import { getNodeIcon } from '../utils/nodeIcons'

const statusColors = {
  running: 'rgb(255 193 7)',  // Amber
  completed: 'rgb(15 163 136)',  // Green from design system
  failed: 'rgb(237 49 93)',  // Red from design system
  pending: 'rgb(116 114 114)',  // Muted gray
}

export default function OrcaNode({ data, id, selected, isConnecting }: any) {
  const selectNode = useWorkflowStore((state) => state.selectNode)
  const executionLogs = useWorkflowStore((state) => state.executionLogs)

  const nodeStatus = executionLogs.find(
    (log) => log.nodeId === id || log.node_id === id
  )?.status || 'pending'

  const statusColor = statusColors[nodeStatus as keyof typeof statusColors] || statusColors.pending
  const isRunning = nodeStatus === 'running'
  const IconComponent = getNodeIcon(data.type)

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        px-0 py-0 rounded border-2 transition cursor-pointer
        hover:opacity-80 relative w-48
        ${selected
          ? 'border-[rgb(var(--color-primary-400))] shadow-lg'
          : 'border-[rgba(var(--color-base-300))] hover:border-[rgba(var(--color-base-400))]'
        }
        ${isRunning ? 'node-running' : ''}
      `}
      style={{
        backgroundColor: 'rgb(var(--color-base-200))',
        borderLeftColor: data.color || 'rgb(var(--color-primary-400))',
        borderLeftWidth: '6px',
        boxShadow: selected ? '0 4px 12px rgba(var(--color-primary-400) / 0.3)' : 'none',
      }}
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

      {/* Content */}
      <div className="flex gap-3 p-3">
        {/* Icon Box */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
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
        </div>

        {/* Label and Type */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="font-medium text-[rgb(var(--color-base-700))] text-sm truncate">
            {data.label}
          </div>
          {data.type && (
            <div className="text-xs text-[rgba(var(--color-base-400))] truncate">
              {data.type.split('.').pop()}
            </div>
          )}
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
