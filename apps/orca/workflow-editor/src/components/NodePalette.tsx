import { useEffect, useState } from 'react'
import { getNodeTypes } from '../api/orcaApi'
import { useWorkflowStore } from '../store/workflowStore'
import { Node } from '@xyflow/react'

// Default node types when API is unavailable
const DEFAULT_NODE_TYPES = {
  trigger: {
    label: 'Trigger',
    description: 'Start a workflow',
    color: '#00d9ff',
    inputs: 0,
    outputs: 1,
  },
  action: {
    label: 'Action',
    description: 'Perform an action',
    color: '#7c4dff',
    inputs: 1,
    outputs: 1,
  },
  condition: {
    label: 'Condition',
    description: 'Add a branch',
    color: '#f59e0b',
    inputs: 1,
    outputs: 2,
  },
  merge: {
    label: 'Merge',
    description: 'Merge branches',
    color: '#10b981',
    inputs: 2,
    outputs: 1,
  },
  output: {
    label: 'Output',
    description: 'Return a value',
    color: '#ef4444',
    inputs: 1,
    outputs: 0,
  },
}

export default function NodePalette() {
  const [nodeTypes, setNodeTypes] = useState<any>(DEFAULT_NODE_TYPES)
  const addNode = useWorkflowStore((state) => state.addNode)

  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const types = await getNodeTypes()
        if (types && Object.keys(types).length > 0) {
          setNodeTypes(types)
        }
      } catch (error) {
        // Use default node types
        setNodeTypes(DEFAULT_NODE_TYPES)
      }
    }
    loadNodeTypes()
  }, [])

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/reactflow', nodeType)
  }

  const handleAddNode = (_nodeType: string, typeInfo: any) => {
    const node: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      data: {
        label: typeInfo.label,
        type: _nodeType,
        color: typeInfo.color,
      },
      position: { x: Math.random() * 250, y: Math.random() * 250 },
    }
    addNode(node as any)
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">
        Components
      </h3>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {Object.entries(nodeTypes).map(([key, info]: [string, any]) => (
          <div
            key={key}
            draggable
            onDragStart={(e) => onDragStart(e, key)}
            onClick={() => handleAddNode(key, info)}
            className="p-3 bg-[#2d2d2d] hover:bg-[#404040] rounded cursor-move text-sm border border-gray-700 hover:border-gray-600 transition"
            style={{
              borderLeftColor: info.color || '#7c4dff',
              borderLeftWidth: '4px',
            }}
          >
            <div className="font-medium text-white">{info.label}</div>
            <div className="text-xs text-gray-400 mt-1">{info.description}</div>
            <div className="text-xs text-gray-500 mt-2">
              {info.inputs} → {info.outputs}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <button className="w-full px-3 py-2 bg-[#7c4dff] hover:bg-[#6a3ecc] rounded text-white text-sm font-medium transition">
          + Create Blank
        </button>
      </div>
    </div>
  )
}
