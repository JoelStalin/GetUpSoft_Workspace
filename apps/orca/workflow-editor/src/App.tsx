import { useState, useEffect } from 'react'
import '@xyflow/react/dist/style.css'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowCanvas from './components/WorkflowCanvas'
import NodePalette from './components/NodePalette'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowToolbar from './components/WorkflowToolbar'
import { useWorkflowStore } from './store/workflowStore'
import { Menu, X } from 'lucide-react'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const workflow = useWorkflowStore((state) => state.workflow)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const setWorkflow = useWorkflowStore((state) => state.setWorkflow)
  const executionLogs = useWorkflowStore((state) => state.executionLogs)

  useEffect(() => {
    const initWorkflow = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        try {
          const listResponse = await fetch('/api/n8n/workflows', { signal: controller.signal })

          if (listResponse.ok) {
            const listData = await listResponse.json()

            if (listData.data && listData.data.length > 0) {
              const firstWorkflow = listData.data[0]
              setWorkflow({
                id: firstWorkflow.id,
                name: firstWorkflow.name,
                active: firstWorkflow.active,
                nodes: firstWorkflow.nodes || [],
                edges: firstWorkflow.connections ? convertConnectionsToEdges(firstWorkflow.connections) : [],
                settings: firstWorkflow.settings,
                createdAt: firstWorkflow.createdAt,
                updatedAt: firstWorkflow.updatedAt,
                orca_meta: firstWorkflow.orca_meta,
              })
              setIsLoading(false)
              return
            }
          }
        } catch (e) {
          clearTimeout(timeoutId)
        }

        setWorkflow({
          id: `workflow-${Date.now()}`,
          name: 'New Workflow',
          active: false,
          nodes: [],
          edges: [],
          settings: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing workflow:', error)
        setIsLoading(false)
      }
    }

    initWorkflow()
  }, [setWorkflow])

  // Sync execution status to workflow nodes
  useEffect(() => {
    if (!workflow || executionLogs.length === 0) return

    const updatedNodes = workflow.nodes.map((node) => {
      const nodeLog = executionLogs.find(
        (log) => log.nodeId === node.id || log.node_id === node.id
      )
      return {
        ...node,
        data: {
          ...node.data,
          status: nodeLog?.status || 'pending',
        },
      }
    })

    if (JSON.stringify(updatedNodes) !== JSON.stringify(workflow.nodes)) {
      const { setWorkflow: setState } = useWorkflowStore.getState()
      setState({
        ...workflow,
        nodes: updatedNodes,
      })
    }
  }, [executionLogs, workflow])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0e27] text-white">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading ORCA Orchestrator...</div>
          <div className="text-gray-400">Initializing workflow editor</div>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen overflow-hidden bg-[#0a0e27] text-white flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-[#1a1f3a] border-b border-gray-700 flex items-center px-4 gap-4 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#2d3550] rounded transition text-[#00d9ff]"
            title={sidebarOpen ? 'Close panel' : 'Open panel'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <WorkflowToolbar />
          </div>

          <div className="text-xs text-gray-400">
            {workflow?.nodes?.length || 0} nodes
          </div>
        </div>

        {/* Main Content - Canvas takes full space */}
        <div className="flex-1 overflow-hidden relative bg-[#0a0e27]" style={{ display: 'flex', flexDirection: 'column' }}>
          {workflow ? (
            <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
              <WorkflowCanvas />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">No Workflow</h2>
                <p className="text-gray-400">Create a new workflow to get started</p>
              </div>
            </div>
          )}

        {/* Floating Sidebar - Components Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-80 bg-[#1a1f3a] border-r border-gray-700 shadow-lg transition-all duration-300 z-30 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            <h3 className="font-bold text-sm uppercase text-gray-300 mb-4">
              Node Library
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Drag components to canvas
            </p>
            <NodePalette />
          </div>
        </div>

        {/* Floating Right Panel - Node Config */}
        {selectedNodeId && (
          <div className="absolute top-0 right-0 h-full w-80 bg-[#1a1f3a] border-l border-gray-700 shadow-lg z-30 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-bold text-sm uppercase text-gray-300 mb-4">
                Node Configuration
              </h3>
              <NodeConfigPanel nodeId={selectedNodeId} />
            </div>
          </div>
        )}
      </div>
    </div>
    </ReactFlowProvider>
  )
}

function convertConnectionsToEdges(connections: Record<string, any>) {
  const edges: any[] = []
  for (const [source, targets] of Object.entries(connections)) {
    if (Array.isArray(targets)) {
      targets.forEach((target: any, index: number) => {
        edges.push({
          id: `${source}-${target.node_id || target}-${index}`,
          source,
          target: target.node_id || target,
        })
      })
    }
  }
  return edges
}
