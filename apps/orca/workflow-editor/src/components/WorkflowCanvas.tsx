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
import { wouldCreateCycle, isValidConnection as validateConnection } from '../utils/connectionValidation'
import OrcaNode from './OrcaNode'
import OdooLiveBrowserNode from './OdooLiveBrowserNode'
import type { AppMode } from '../types/modes'

const nodeTypes = {
  orcaNode: OrcaNode,
  default: OrcaNode,
  'odoo-live-browser': OdooLiveBrowserNode,
}

/**
 * MIGRATED: Uses P2 hooks (useWorkflowOperations, useWorkflowHistory)
 */
export default function WorkflowCanvas({ activeMode = 'workflow' }: { activeMode?: AppMode }) {
  const { workflow, selectedNodeId, addNode, updateNode, addEdge: addEdgeToStore, deleteNode, deleteEdge, pushHistory } = useWorkflowOperations()
  const { undo, redo } = useWorkflowHistory()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlow = useReactFlow() as any

  const [nodes, setNodes, onNodesChange] = useNodesState([...(workflow?.nodes || [])])
  const [edges, setEdges, onEdgesChange] = useEdgesState([...(workflow?.edges || [])])
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [miniMapVisible] = useState(false)
  const [isCanvasReady, setIsCanvasReady] = useState(false)

  useEffect(() => {
    const element = reactFlowWrapper.current
    if (!element) return

    const updateCanvasReady = () => {
      const rect = element.getBoundingClientRect()
      setIsCanvasReady(Number.isFinite(rect.width) && Number.isFinite(rect.height) && rect.width > 0 && rect.height > 0)
    }

    updateCanvasReady()
    const observer = new ResizeObserver(updateCanvasReady)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const nodeBelongsToMode = useCallback((node: any) => {
    const nodeMode = node?.data?.mode
    const nodeType = node?.data?.type || ''
    if (activeMode === 'workflow') {
      return !nodeMode && !String(nodeType).startsWith('web.layout.')
    }
    if (activeMode === 'web') {
      return nodeMode === 'web' || String(nodeType).startsWith('web.layout.')
    }
    if (activeMode === 'ai') {
      return nodeMode === 'ai' || String(nodeType).startsWith('stitch.ai.') || String(nodeType).startsWith('stitch.arch.') || String(nodeType).startsWith('nemoclaw.core.')
    }
    if (activeMode === 'mobile') {
      return nodeMode === 'mobile'
    }
    return true
  }, [activeMode])

  // Sync workflow nodes to ReactFlow nodes
  useEffect(() => {
    if (workflow?.nodes) {
      setNodes((workflow.nodes as any[]).filter(nodeBelongsToMode))
    }
  }, [workflow?.nodes, setNodes, nodeBelongsToMode])

  // Sync workflow edges to ReactFlow edges
  useEffect(() => {
    if (workflow?.edges) {
      const visibleNodeIds = new Set((workflow.nodes || []).filter(nodeBelongsToMode).map((node: any) => node.id))
      setEdges((workflow.edges as any[]).filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)))
    }
  }, [workflow?.edges, workflow?.nodes, setEdges, nodeBelongsToMode])

  // Setup drag and drop with React handlers on wrapper (already added to JSX)
  // No additional listeners needed - the React onDragOver and onDrop handlers on the wrapper div are sufficient

  // Keyboard shortcuts for undo/redo/delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        if (selectedNodeId) {
          if (workflow) {
            pushHistory(workflow)
          }
          deleteNode(selectedNodeId)
        } else if (selectedEdgeId) {
          if (workflow) {
            pushHistory(workflow)
          }
          deleteEdge(selectedEdgeId)
          setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
          setSelectedEdgeId(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, selectedEdgeId, pushHistory, undo, redo, deleteNode, deleteEdge, setEdges, workflow])

  // Sync node position changes back to store
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const node = nodes.find((n) => n.id === change.id)
          if (node) {
            updateNode({ ...node, position: change.position })
          }
        }
      })
      onNodesChange(changes)
    },
    [onNodesChange, updateNode, nodes]
  )

  // Validate connection - prevent self-loops, duplicates, and cycles
  const isValidConnection = useCallback((connection: Connection) => {
    const result = validateConnection(
      connection.source || null,
      connection.target || null,
      edges,
      nodes
    )

    if (!result.valid) {
      console.warn('Invalid connection:', result.reason)
    }

    return result.valid
  }, [nodes, edges])

  // Get edge style based on connection metadata
  const getEdgeStyle = useCallback((edge: any) => {
    const isSelected = selectedEdgeId === edge.id
    return {
      stroke: isSelected ? '#ff9f43' : '#4A9EFF',
      strokeWidth: isSelected ? 3 : 2,
      opacity: 1,
      transition: 'all 0.3s ease',
    }
  }, [selectedEdgeId])

  // Handle node-to-node connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) {
        console.warn('Invalid connection attempt:', connection)
        return
      }

      if (workflow) {
        pushHistory(workflow)
      }
      const edgeId = `${connection.source}-${connection.target}-${Date.now()}`
      const edge: Edge = {
        id: edgeId,
        source: connection.source || '',
        target: connection.target || '',
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#4A9EFF',
          strokeWidth: 2,
          opacity: 0.8,
        },
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

      if (workflow) {
        pushHistory(workflow)
      }

      // Calculate position with fallback if project() fails
      let position = { x: 0, y: 0 }
      try {
        if (reactFlow?.screenToFlowPosition && typeof reactFlow.screenToFlowPosition === 'function') {
          position = reactFlow.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          })
        } else if (reactFlow?.project && typeof reactFlow.project === 'function') {
          position = reactFlow.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })
        } else {
          throw new Error('React Flow coordinate projection unavailable')
        }
      } catch {
        // Fallback: use relative canvas position
        position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        }
      }

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
    [reactFlow, addNode, setNodes, pushHistory]
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
      onClick={() => setSelectedEdgeId(null)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView={isCanvasReady && nodes.length > 0}
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        connectionLineStyle={{ stroke: '#99F6E4', strokeWidth: 2 }}
      >
        <Background color="rgba(255, 255, 255, 0.035)" gap={32} size={1} />
        <Controls position="bottom-right" />
        {miniMapVisible && isCanvasReady && <MiniMap
          nodeColor={(node: any): string => {
            if (selectedNodeId === node.id) return '#99F6E4'
            return '#44505c'
          }}
          nodeStrokeColor="rgba(153, 246, 228, 0.32)"
          maskColor="rgba(0, 0, 0, 0.36)"
          pannable
          zoomable
          position="bottom-left"
          style={{
            backgroundColor: 'rgba(10, 12, 14, 0.86)',
            borderRadius: '8px',
            border: '1px solid rgba(153, 246, 228, 0.16)',
            width: '200px',
            height: '150px',
            fontSize: '11px',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
          }}
        />}
      </ReactFlow>
    </div>
  )
}
