import { Handle, Position } from '@xyflow/react'
import { useWorkflowStore } from '../store/workflowStore'

export default function OrcaNode({ data, id, selected }: any) {
  const selectNode = useWorkflowStore((state) => state.selectNode)

  return (
    <div
      onClick={() => selectNode(id)}
      className={`px-4 py-3 rounded bg-[#2d2d2d] border-2 transition cursor-pointer ${
        selected ? 'border-[#7c4dff] shadow-lg shadow-[#7c4dff]/50' : 'border-gray-700'
      }`}
      style={{
        borderLeftColor: data.color || '#7c4dff',
        borderLeftWidth: '4px',
      }}
    >
      <div className="font-medium text-white text-sm">{data.label}</div>
      {data.type && (
        <div className="text-xs text-gray-400 mt-1">{data.type}</div>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
