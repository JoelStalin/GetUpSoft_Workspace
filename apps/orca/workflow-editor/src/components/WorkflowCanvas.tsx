import { useCallback, useRef, useEffect, useState } from 'react'
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
  Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useWorkflowHistory } from '../hooks/useWorkflowHistory'
import OrcaNode from './OrcaNode'

const nodeTypes = {
  orcaNode: OrcaNode,
  default: OrcaNode,
}

export default function WorkflowCanvas() {
  const { workflow, selectedNodeId, addNode, updateNode, addEdge: addEdgeToStore, deleteNode, deleteEdge } = useWorkflowOperations()
  const { pushHistory, undo, redo } = useWorkflowHistory()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project } = useReactFlow() as any

  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || [])
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

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

  // Keyboard shortcuts for undo/redo/delete
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
        e.preventDefault()
        if (selectedNodeId) {
          pushHistory()
          deleteNode(selectedNodeId)
        } else if (selectedEdgeId) {
          pushHistory()
          deleteEdge(selectedEdgeId)
          setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
          setSelectedEdgeId(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, selectedEdgeId, pushHistory, undo, redo, deleteNode, deleteEdge, setEdges])

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

  // Validate connection - prevent self-loops and circular references
  const isValidConnection = useCallback((connection: Connection) => {
    if (connection.source === connection.target) {
      return false
    }

    const sourceNode = nodes.find((n) => n.id === connection.source)
    const targetNode = nodes.find((n) => n.id === connection.target)

    if (!sourceNode || !targetNode) {
      return false
    }

    return true
  }, [nodes])

  // Get edge style based on connection metadata
  const getEdgeStyle = useCallback((edge: any) => {
    const isSelected = selectedEdgeId === edge.id
    return {
      stroke: isSelected ? '#ff9f43' : '#7c4dff',
      strokeWidth: isSelected ? 3 : 2,
    }
  }, [selectedEdgeId])

  // Handle node-to-node connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) {
        console.warn('Invalid connection attempt:', connection)
        return
      }

      pushHistory()
      const edgeId = `${connection.source}-${connection.target}-${Date.now()}`
      const edge: Edge = {
        id: edgeId,
        source: connection.source || '',
        target: connection.target || '',
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#7c4dff', strokeWidth: 2 },
        data: { priority: 'normal' },
      }
      setEdges((eds: any[]) => addEdgeUtil(connection, eds))
      addEdgeToStore(edge)
    },
    [isValidConnection, setEdges, addEdgeToStore, pushHistory]
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

  const styledEdges = edges.map((edge) => ({
    ...edge,
    style: getEdgeStyle(edge),
  }))

  const handleEdgeClick = useCallback(
    (e: React.MouseEvent, edge: Edge) => {
      e.stopPropagation()
      setSelectedEdgeId(edge.id)
    },
    []
  )

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => setSelectedEdgeId(null)}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        connectionLineStyle={{ stroke: '#7c4dff', strokeWidth: 2 }}
      >
        <Background color="rgb(var(--color-base-300))" gap={16} size={2} />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={(node: any): string => {
            if (selectedNodeId === node.id) return 'rgb(var(--color-primary-400))'
            return node.data?.color || 'rgb(var(--color-base-300))'
          }}
          pannable
          zoomable
          position="bottom-left"
          style={{
            backgroundColor: 'rgba(var(--color-base-200))',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  )
}
