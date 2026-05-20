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
        setNodeTypes(types)
      } catch (error) {
        console.error('Failed to load node types:', error)
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

  const handleAddNode = (nodeType: string, typeInfo: any) => {
    const node: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      data: { label: typeInfo.label },
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
              borderLeftColor: info.color,
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
