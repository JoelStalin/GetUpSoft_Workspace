import { useEffect, useState } from 'react'
import { getNodeTypes } from '../api/orcaApi'
import { useWorkflowStore } from '../store/workflowStore'
import { Node } from '@xyflow/react'
import { Search } from 'lucide-react'

export default function NodePalette() {
  const [nodeTypes, setNodeTypes] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const addNode = useWorkflowStore((state) => state.addNode)
  const pushHistory = useWorkflowStore((state) => state.pushHistory)

  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const types = await getNodeTypes()
        // Backend returns objects with 'type' property
        if (types && typeof types === 'object' && Object.keys(types).length > 0) {
          setNodeTypes(types)
        } else {
          setNodeTypes(getDefaultNodeTypes())
        }
      } catch (error) {
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
    pushHistory()
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

  const getCategory = (nodeType: string): string => {
    if (nodeType.includes('trigger')) return 'Triggers'
    if (nodeType.includes('aiPrompt')) return 'AI'
    if (nodeType.includes('http')) return 'Network'
    if (nodeType.includes('condition') || nodeType.includes('loop')) return 'Control Flow'
    return 'Utils'
  }

  const grouped = Object.entries(nodeTypes).reduce(
    (acc, [key, info]: [string, any]) => {
      const category = getCategory(key)
      if (!acc[category]) acc[category] = []
      acc[category].push([key, info])
      return acc
    },
    {} as Record<string, [string, any][]>
  )

  const filtered = Object.entries(grouped).reduce(
    (acc, [category, items]) => {
      const filtered = items.filter(
        ([, info]: [string, any]) =>
          info.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filtered.length > 0) {
        acc[category] = filtered
      }
      return acc
    },
    {} as Record<string, [string, any][]>
  )

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-[#0a0e27] border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7c4dff]"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {Object.entries(filtered).map(([category, items]) => (
          <div key={category} className="node-item">
            <button
              onClick={() =>
                setExpandedCategories((prev) => ({
                  ...prev,
                  [category]: !prev[category],
                }))
              }
              className="w-full text-left text-xs font-semibold text-gray-400 hover:text-gray-300 flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1f3a] transition"
            >
              <span>{category}</span>
              <span className="text-xs bg-[#2d3550] px-2 py-1 rounded">
                {items.length}
              </span>
            </button>

            {(expandedCategories[category] !== false || !expandedCategories[category] === undefined) && (
              <div className="space-y-1 ml-2">
                {items.map(([key, info]: [string, any]) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={(e) => onDragStart(e, key)}
                    onClick={() => handleAddNode(key, info)}
                    className="node-row hover:brightness-110 transition-all cursor-grab active:cursor-grabbing"
                    style={{
                      backgroundColor: hexToPanelColor(info.color || '#30343a'),
                      borderLeft: `4px solid ${info.color || '#30343a'}`,
                      padding: '8px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    <div className="node-row-title font-semibold text-sm">
                      {info.label}
                    </div>
                    <div className="node-row-description text-xs text-gray-400 mt-0.5">
                      {info.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function hexToPanelColor(hex: string) {
  if (!hex.startsWith('#') || hex.length !== 7) return 'rgba(48, 52, 58, 0.48)'

  const red = Number.parseInt(hex.slice(1, 3), 16)
  const green = Number.parseInt(hex.slice(3, 5), 16)
  const blue = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${red}, ${green}, ${blue}, 0.12)`
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
