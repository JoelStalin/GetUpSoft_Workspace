import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  addEdge as addEdgeUtil,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  useReactFlow,
  Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowStore } from '../store/workflowStore'
import OrcaNode from './OrcaNode'

const nodeTypes = {
  orcaNode: OrcaNode,
  default: OrcaNode,
}

export default function WorkflowCanvas() {
  const workflow = useWorkflowStore((state) => state.workflow)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const addNode = useWorkflowStore((state) => state.addNode)
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const addEdgeToStore = useWorkflowStore((state) => state.addEdge)
  const pushHistory = useWorkflowStore((state) => state.pushHistory)
  const undo = useWorkflowStore((state) => state.undo)
  const redo = useWorkflowStore((state) => state.redo)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project } = useReactFlow() as any

  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || [])

  // Sync workflow nodes to ReactFlow nodes
  useEffect(() => {
    if (workflow?.nodes) {
      setNodes(workflow.nodes as any[])
    }
  }, [workflow?.nodes, setNodes])

  // Sync workflow edges to ReactFlow edges
  useEffect(() => {
    if (workflow?.edges) {
      setEdges(workflow.edges as any[])
    }
  }, [workflow?.edges, setEdges])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        pushHistory()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault()
          pushHistory()
          useWorkflowStore.getState().deleteNode(selectedNodeId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, pushHistory, undo, redo])

  // Sync node position changes back to store
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNode(change.id, { position: change.position })
        }
      })
      onNodesChange(changes)
    },
    [onNodesChange, updateNode]
  )

  // Handle node-to-node connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      pushHistory()
      const edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source || '',
        target: connection.target || '',
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#7c4dff', strokeWidth: 2 },
      }
      setEdges((eds: any[]) => addEdgeUtil(connection, eds))
      addEdgeToStore(edge)
    },
    [setEdges, addEdgeToStore, pushHistory]
  )

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop of nodes from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const nodeType = event.dataTransfer.getData('application/reactflow')
      if (!nodeType) return

      pushHistory()

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'default',
        data: {
          label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          type: nodeType,
          color: '#7c4dff',
        },
        position,
      }

      addNode(newNode as any)
      setNodes((nds: any[]) => [...nds, newNode])
    },
    [project, addNode, setNodes, pushHistory]
  )

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        connectionLineStyle={{ stroke: '#7c4dff', strokeWidth: 2 }}
      >
        <Background color="#404040" gap={16} size={2} />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={(node) => {
            if (selectedNodeId === node.id) return '#7c4dff'
            return node.data?.color || '#2d2d2d'
          }}
          pannable
          zoomable
          position="bottom-left"
          style={{
            backgroundColor: '#1a1f3a',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  )
}
