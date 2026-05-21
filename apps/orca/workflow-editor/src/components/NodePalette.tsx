import { useEffect, useState } from 'react'
import { getNodeTypes } from '../api/orcaApi'
import { useWorkflowStore } from '../store/workflowStore'
import { Node } from '@xyflow/react'

export default function NodePalette() {
  const [nodeTypes, setNodeTypes] = useState<any>({})
  const addNode = useWorkflowStore((state) => state.addNode)

  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const types = await getNodeTypes()
        // Backend returns objects with 'type' property - convert to simple key:value
        if (types && typeof types === 'object' && Object.keys(types).length > 0) {
          console.log('Loaded node types from backend:', Object.keys(types).length)
          setNodeTypes(types)
        } else {
          console.log('Backend returned empty node types, using defaults')
          setNodeTypes(getDefaultNodeTypes())
        }
      } catch (error) {
        console.log('Failed to load node types, using defaults:', error)
        setNodeTypes(getDefaultNodeTypes())
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
        Node Types
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

function getDefaultNodeTypes() {
  return {
    'orca-nodes-base.trigger': {
      type: 'orca-nodes-base.trigger',
      label: 'Trigger',
      color: '#ff6d5a',
      inputs: 0,
      outputs: 1,
      icon: 'bell',
      description: 'Start a workflow execution',
    },
    'orca-nodes-base.aiPrompt': {
      type: 'orca-nodes-base.aiPrompt',
      label: 'AI Prompt',
      color: '#7c4dff',
      inputs: 1,
      outputs: 1,
      icon: 'brain',
      description: 'Call an AI model with a prompt',
    },
    'orca-nodes-base.httpRequest': {
      type: 'orca-nodes-base.httpRequest',
      label: 'HTTP Request',
      color: '#1a9ba1',
      inputs: 1,
      outputs: 1,
      icon: 'cloud',
      description: 'Make an HTTP request',
    },
    'orca-nodes-base.condition': {
      type: 'orca-nodes-base.condition',
      label: 'Condition',
      color: '#ff9f43',
      inputs: 1,
      outputs: 2,
      icon: 'code-branch',
      description: 'Conditional branching',
    },
    'orca-nodes-base.loop': {
      type: 'orca-nodes-base.loop',
      label: 'Loop',
      color: '#10ac84',
      inputs: 1,
      outputs: 1,
      icon: 'repeat',
      description: 'Iterate over a list',
    },
    'orca-nodes-base.setVariable': {
      type: 'orca-nodes-base.setVariable',
      label: 'Set Variable',
      color: '#576574',
      inputs: 1,
      outputs: 1,
      icon: 'assign',
      description: 'Store a value in a variable',
    },
    'orca-nodes-base.executeCommand': {
      type: 'orca-nodes-base.executeCommand',
      label: 'Execute',
      color: '#ee5a24',
      inputs: 1,
      outputs: 1,
      icon: 'terminal',
      description: 'Execute a command or script',
    },
    'orca-nodes-base.end': {
      type: 'orca-nodes-base.end',
      label: 'End',
      color: '#353b48',
      inputs: 1,
      outputs: 0,
      icon: 'stop-circle',
      description: 'End the workflow',
    },
  }
}
