import { Handle, Position } from '@xyflow/react'
import { useWorkflowStore } from '../store/workflowStore'
import { getNodeIcon } from '../utils/nodeIcons'

const statusColors = {
  running: '#fbbf24',
  completed: '#10b981',
  failed: '#ef4444',
  pending: '#6b7280',
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
        px-0 py-0 rounded bg-[#2d2d2d] border-2 transition cursor-pointer
        hover:brightness-110 relative w-48
        ${selected ? 'border-[#7c4dff] shadow-lg shadow-[#7c4dff]/50' : 'border-gray-700 hover:border-gray-600'}
        ${isRunning ? 'node-running' : ''}
      `}
      style={{
        borderLeftColor: data.color || '#7c4dff',
        borderLeftWidth: '6px',
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
            backgroundColor: `${data.color || '#7c4dff'}20`,
          }}
        >
          {IconComponent && (
            <IconComponent
              size={20}
              style={{ color: data.color || '#7c4dff' }}
            />
          )}
        </div>

        {/* Label and Type */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="font-medium text-white text-sm truncate">
            {data.label}
          </div>
          {data.type && (
            <div className="text-xs text-gray-400 truncate">
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
