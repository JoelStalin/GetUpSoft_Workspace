import { useWorkflowStore } from '../store/workflowStore'

interface NodeConfigPanelProps {
  nodeId: string
}

export default function NodeConfigPanel({ nodeId }: NodeConfigPanelProps) {
  const workflow = useWorkflowStore((state) => state.workflow)
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const deleteNode = useWorkflowStore((state) => state.deleteNode)

  const node = workflow?.nodes.find((n) => n.id === nodeId)

  if (!node) {
    return (
      <div className="p-4">
        <p className="text-gray-400 text-sm">Node not found</p>
      </div>
    )
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(nodeId, {
      data: {
        ...node.data,
        label: e.target.value,
      },
    })
  }

  const handleParameterChange = (key: string, value: any) => {
    updateNode(nodeId, {
      data: {
        ...node.data,
        parameters: {
          ...(node.data.parameters || {}),
          [key]: value,
        },
      },
    })
  }

  const handleDelete = () => {
    if (confirm('Delete this node?')) {
      deleteNode(nodeId)
    }
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">
        Node Configuration
      </h3>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Node name */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={node.data.label}
            onChange={handleNameChange}
            className="w-full px-2 py-1 bg-[#2d2d2d] border border-gray-700 rounded text-white text-sm focus:border-[#7c4dff] focus:outline-none"
          />
        </div>

        {/* Node type */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Type
          </label>
          <div className="px-2 py-1 bg-[#2d2d2d] border border-gray-700 rounded text-white text-sm">
            {node.data.type}
          </div>
        </div>

        {/* Parameters */}
        {node.data.parameters && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Parameters
            </label>
            <div className="space-y-2">
              {Object.entries(node.data.parameters).map(([key, value]) => (
                <input
                  key={key}
                  type="text"
                  placeholder={key}
                  defaultValue={String(value || '')}
                  onChange={(e) => handleParameterChange(key, e.target.value)}
                  className="w-full px-2 py-1 bg-[#2d2d2d] border border-gray-700 rounded text-white text-xs focus:border-[#7c4dff] focus:outline-none"
                />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            placeholder="Add notes about this node..."
            className="w-full px-2 py-1 bg-[#2d2d2d] border border-gray-700 rounded text-white text-xs focus:border-[#7c4dff] focus:outline-none resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Delete button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleDelete}
          className="w-full px-3 py-2 bg-[#ff6d5a] hover:bg-[#e55a47] rounded text-white text-sm font-medium transition"
        >
          Delete Node
        </button>
      </div>
    </div>
  )
}
