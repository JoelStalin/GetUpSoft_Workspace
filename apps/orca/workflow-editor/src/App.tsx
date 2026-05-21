import { useState, useEffect } from 'react'
import '@xyflow/react/dist/style.css'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowCanvas from './components/WorkflowCanvas'
import NodePalette from './components/NodePalette'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowToolbar from './components/WorkflowToolbar'
import ExecutionViewer from './components/ExecutionViewer'
import { useWorkflowStore } from './store/workflowStore'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const workflow = useWorkflowStore((state) => state.workflow)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const setWorkflow = useWorkflowStore((state) => state.setWorkflow)

  useEffect(() => {
    const initWorkflow = async () => {
      setIsLoading(true)

      try {
        // Try to load existing workflow
        try {
          const listResponse = await fetch('/api/n8n/workflows')

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
              return
            }
          }
        } catch (e) {
          // API not available, will fall back to default
        }

        // Fall back to default workflow
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
      } finally {
        setIsLoading(false)
      }
    }
    initWorkflow()
  }, [setWorkflow])

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
      <div
        className="h-screen flex flex-col bg-[#0a0e27] text-white overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateColumns: `${sidebarMinimized ? '60px' : '250px'} 1fr 340px`,
          gridTemplateAreas: `
            "header header header"
            "sidebar canvas rightpanel"
            "prompt prompt prompt"
          `,
        }}
      >
        {/* Header/Toolbar */}
        <div style={{ gridArea: 'header' }}>
          <WorkflowToolbar />
        </div>

        {/* Left Sidebar - Minimized */}
        <div
          style={{ gridArea: 'sidebar' }}
          className="border-r border-gray-700 bg-[#1a1f3a] overflow-y-auto transition-all duration-300 flex flex-col items-center pt-4"
        >
          <button
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="p-2 hover:bg-[#2d3550] rounded transition mb-4 text-[#00d9ff]"
            title={sidebarMinimized ? 'Expand' : 'Minimize'}
          >
            {sidebarMinimized ? '≡' : '✕'}
          </button>
          {!sidebarMinimized && (
            <div className="w-full px-3">
              <h3 className="font-bold mb-4 text-xs uppercase text-gray-400 text-center">
                Components
              </h3>
              <NodePalette />
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div style={{ gridArea: 'canvas' }} className="flex flex-col bg-[#0d0d0f] overflow-hidden">
          {workflow ? (
            <>
              <WorkflowCanvas />
              <div className="border-t border-gray-700 bg-[#1a1f3a] p-3 max-h-32 overflow-y-auto">
                <ExecutionViewer />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">No Workflow Selected</h2>
                <p className="text-gray-400 mb-6">Create a new workflow or load an existing one.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Component Library */}
        <div style={{ gridArea: 'rightpanel' }} className="border-l border-gray-700 bg-[#1a1f3a] overflow-y-auto p-4">
          <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">Component Library</h3>
          {selectedNodeId ? (
            <NodeConfigPanel nodeId={selectedNodeId} />
          ) : (
            <div className="text-gray-500 text-xs">
              <p>Select a node to edit its configuration.</p>
              <p className="mt-2">Or drag components from the left panel.</p>
            </div>
          )}
        </div>

        {/* AI Prompt Area */}
        <div
          style={{ gridArea: 'prompt' }}
          className="border-t border-gray-700 bg-[#1a1f3a] p-4 flex gap-3"
        >
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="What would you like to create or change?"
            className="flex-1 px-4 py-2 bg-[#2d3550] border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#00d9ff] transition"
          />
          <button className="px-6 py-2 bg-[#00d9ff] hover:bg-[#00b8d4] text-[#0a0e27] font-medium rounded text-sm transition">
            Generate
          </button>
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
