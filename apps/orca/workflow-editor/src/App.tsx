import { useState, useEffect } from 'react'
import '@xyflow/react/dist/style.css'
import WorkflowCanvas from './components/WorkflowCanvas'
import NodePalette from './components/NodePalette'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowToolbar from './components/WorkflowToolbar'
import ExecutionViewer from './components/ExecutionViewer'
import { useWorkflowStore } from './store/workflowStore'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const workflow = useWorkflowStore((state) => state.workflow)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)

  useEffect(() => {
    // Load workflows on mount
    const loadWorkflows = async () => {
      try {
        const response = await fetch('/api/n8n/workflows')
        const data = await response.json()
        console.log('Workflows loaded:', data)
      } catch (error) {
        console.error('Failed to load workflows:', error)
      }
    }
    loadWorkflows()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-[#1a1b1e] text-white">
      {/* Toolbar */}
      <WorkflowToolbar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Node palette */}
        {sidebarOpen && (
          <div className="w-56 border-r border-gray-700 bg-[#1a1b1e] overflow-y-auto">
            <NodePalette />
          </div>
        )}

        {/* Canvas center */}
        <div className="flex-1 flex flex-col bg-[#0d0d0f]">
          {workflow ? (
            <>
              <WorkflowCanvas />
              {/* Execution logs at bottom */}
              <div className="border-t border-gray-700 bg-[#1a1b1e]">
                <ExecutionViewer />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">No Workflow Selected</h2>
                <p className="text-gray-400 mb-6">
                  Create a new workflow or select an existing one to get started.
                </p>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-4 py-2 bg-[#7c4dff] hover:bg-[#6a3ecc] rounded text-white text-sm font-medium"
                >
                  Toggle Sidebar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - Node config */}
        {selectedNodeId && (
          <div className="w-80 border-l border-gray-700 bg-[#1a1b1e] overflow-y-auto">
            <NodeConfigPanel nodeId={selectedNodeId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 bg-[#1a1b1e] px-4 py-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Orca Workflow Editor v1.0</span>
          <span>
            {workflow ? `${workflow.nodes.length} nodes` : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}
