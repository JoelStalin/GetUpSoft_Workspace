import { Handle, Position } from '@xyflow/react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useExecutionStatus } from '../hooks/useExecutionStatus'
import { useAINodeEditor } from '../hooks/useAINodeEditor'
import { useToast } from '../contexts/ToastContext'
import { getNodeIcon } from '../utils/nodeIcons'
import ContextMenu from './ui/ContextMenu'

const statusColors = {
  running: 'rgb(255 193 7)',  // Amber
  completed: 'rgb(15 163 136)',  // Green from design system
  failed: 'rgb(237 49 93)',  // Red from design system
  pending: 'rgb(116 114 114)',  // Muted gray
}

export default function OrcaNode({ data, id, selected, isConnecting }: any) {
  const { selectNode, deleteNode, addNode, workflow } = useWorkflowOperations()
  const { getNodeLog } = useExecutionStatus()
  const { addToast } = useToast()
  const { generateNodeSuggestions } = useAINodeEditor()

  const nodeLog = getNodeLog(id)
  const nodeStatus = nodeLog?.status || 'pending'
  const errorMessage = nodeLog?.error || nodeLog?.message

  const statusColor = statusColors[nodeStatus as keyof typeof statusColors] || statusColors.pending
  const isRunning = nodeStatus === 'running'
  const isFailed = nodeStatus === 'failed'
  const isCompleted = nodeStatus === 'completed'
  const IconComponent = getNodeIcon(data.type)

  const handleDuplicate = () => {
    if (workflow?.nodes) {
      const node = workflow.nodes.find((n) => n.id === id)
      if (node) {
        addNode({
          ...node,
          id: `${node.type}-${Date.now()}`,
          position: {
            x: node.position.x + 80,
            y: node.position.y + 80,
          },
        })
        addToast('Node duplicated', 'success')
      }
    }
  }

  const handleEditWithAI = async () => {
    const suggestions = await generateNodeSuggestions(data.label || 'Untitled', data.type || 'unknown')
    if (suggestions.length > 0) {
      addToast(`AI generated ${suggestions.length} suggestions for this node`, 'success')
      suggestions.forEach((s) => {
        if (s.confidence > 0.8) {
          addToast(`Suggestion (${(s.confidence * 100).toFixed(0)}%): ${s.suggestion}`, 'info')
        }
      })
    } else {
      addToast('No AI suggestions available for this node type', 'info')
    }
  }

  return (
    <ContextMenu
      nodeId={id}
      nodeName={data.label}
      nodeType={data.type}
      onDuplicate={handleDuplicate}
      onDelete={() => {
        deleteNode(id)
        addToast('Node deleted', 'success')
      }}
      onEditWithAI={handleEditWithAI}
    >
      <div
      onClick={() => selectNode(id)}
      data-status={nodeStatus}
      className={`
        orca-node-card
        px-0 py-0 rounded-lg border-2 transition-all duration-300 cursor-pointer
        relative w-56 group will-change-transform
        ${selected
          ? 'border-[rgb(var(--color-primary-400))] node-selected'
          : 'border-[rgba(100,100,120,0.5)] hover:border-[rgba(74,158,255,0.5)]'
        }
        ${isRunning ? 'node-running' : ''}
        ${isFailed ? 'border-[rgb(237_49_93)]' : ''}
        ${isCompleted ? 'border-[rgb(15_163_136)]' : ''}
      `}
      style={{
        borderLeftColor: data.color || 'rgb(var(--color-primary-400))',
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
          transition: 'background-color 0.4s ease, border-color 0.4s ease',
        }}
      />

      {/* Error Tooltip */}
      {errorMessage && (
        <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgb(237_49_93)] text-white text-xs px-2 py-1 rounded z-10 w-48 break-words pointer-events-none">
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
          backgroundColor: data.color || 'rgb(var(--color-primary-400))',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={!isConnecting}
        style={{
          backgroundColor: data.color || 'rgb(var(--color-primary-400))',
        }}
      />
      </div>
    </ContextMenu>
  )
}
