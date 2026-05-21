import { useEffect, useState } from 'react'
import { getNodeTypes } from '../api/orcaApi'
import { useWorkflowStore } from '../store/workflowStore'
import { Node } from '@xyflow/react'

// Default n8n node types when API is unavailable
const DEFAULT_NODE_TYPES = {
  'n8n-trigger': {
    label: 'Trigger',
    description: 'Start workflow execution',
    color: '#ff5e00',
    inputs: 0,
    outputs: 1,
  },
  'n8n-http-request': {
    label: 'HTTP Request',
    description: 'Make HTTP API calls',
    color: '#00b4ff',
    inputs: 1,
    outputs: 1,
  },
  'n8n-ai-prompt': {
    label: 'AI Prompt',
    description: 'Generate content with AI',
    color: '#ff00d9',
    inputs: 1,
    outputs: 1,
  },
  'n8n-condition': {
    label: 'If/Condition',
    description: 'Branch workflow based on conditions',
    color: '#ffb400',
    inputs: 1,
    outputs: 2,
  },
  'n8n-loop': {
    label: 'Loop',
    description: 'Iterate over items',
    color: '#00ff5e',
    inputs: 1,
    outputs: 1,
  },
  'n8n-code': {
    label: 'Code',
    description: 'Execute JavaScript code',
    color: '#7c4dff',
    inputs: 1,
    outputs: 1,
  },
  'n8n-merge': {
    label: 'Merge',
    description: 'Combine branches',
    color: '#ff5e5e',
    inputs: 2,
    outputs: 1,
  },
  'n8n-output': {
    label: 'Output',
    description: 'Return workflow results',
    color: '#00ff00',
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
