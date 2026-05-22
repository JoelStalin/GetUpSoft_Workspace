import { useState, useEffect, useCallback } from 'react'
import '@xyflow/react/dist/style.css'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowCanvas from './components/WorkflowCanvas'
import NodePalette from './components/NodePalette'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowToolbar from './components/WorkflowToolbar'
import SearchDialog from './components/Search/SearchDialog'
import ExecutionTimeline from './components/ExecutionTimeline'
import { WorkflowProvider } from './contexts/WorkflowContext'
import { ExecutionProvider } from './contexts/ExecutionContext'
import { useWorkflowOperations } from './hooks/useWorkflowOperations'
import { useWorkflowState } from './hooks/useWorkflowState'
import { useExecutionStatus } from './hooks/useExecutionStatus'
import { useSearch } from './hooks/useSearch'
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { useClipboard } from './hooks/useClipboard'
import { useMultiSelect } from './hooks/useMultiSelect'
import { addToRecent } from './utils/search/searchHistory'
import { Menu, X, ChevronUp, ChevronDown } from 'lucide-react'

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [executionPanelOpen, setExecutionPanelOpen] = useState(true)
  const [nodeTypes, setNodeTypes] = useState<Record<string, any>>({})
  const { workflow, setWorkflow, addNode, deleteNode, selectedNodeId } = useWorkflowOperations()
  const { logs: executionLogs } = useExecutionStatus()
  const { copy, paste, hasContent } = useClipboard()
  const multiSelect = useMultiSelect()
  const {
    query,
    results,
    isOpen: searchOpen,
    isLoading: searchLoading,
    selectedIndex,
    history,
    handleSearch,
    handleOpen: openSearch,
    handleClose: closeSearch,
    handleSelectResult,
    handleNavigate,
    clearQuery,
    clearHistory,
  } = useSearch({ nodeTypes })

  // Apply dark theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'dark')
  }, [])

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    { ...SHORTCUTS.SEARCH, callback: openSearch },
  ])

  // Handle additional keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete node with Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault()
        deleteNode(selectedNodeId)
      }

      // Duplicate node with Ctrl+D or Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNodeId) {
        e.preventDefault()
        if (workflow?.nodes) {
          const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId)
          if (selectedNode) {
            addNode({
              ...selectedNode,
              id: `${selectedNode.type}-${Date.now()}`,
              position: {
                x: selectedNode.position.x + 80,
                y: selectedNode.position.y + 80,
              },
            })
          }
        }
      }

      // Copy selected nodes with Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        if (workflow?.nodes && selectedNodeId) {
          const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId)
          if (selectedNode) {
            copy([selectedNode])
          }
        }
      }

      // Paste nodes with Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        if (hasContent() && workflow) {
          const pastedNodes = paste(100, 100)
          if (pastedNodes.length > 0) {
            setWorkflow({
              ...workflow,
              nodes: [...(workflow.nodes || []), ...pastedNodes],
            })
          }
        }
      }

      // Select all with Ctrl+A or Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        if (workflow?.nodes) {
          multiSelect.selectAll(workflow.nodes.map(n => n.id))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, workflow, deleteNode, addNode, copy, paste, hasContent, setWorkflow, multiSelect])

  // Load node types
  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const response = await fetch('/api/n8n/node-types')
        if (response.ok) {
          const types = await response.json()
          setNodeTypes(types)
        }
      } catch (error) {
        console.warn('Failed to load node types for search')
      }
    }
    loadNodeTypes()
  }, [])

  // Handle search result selection
  const handleSelectSearchResult = useCallback(
    (result: any) => {
      const selectedResult = handleSelectResult(result)

      if (selectedResult && selectedResult.type === 'node') {
        // Add node to recent
        addToRecent(selectedResult.id, selectedResult.label, selectedResult.color || '#7c4dff')
      }
    },
    [handleSelectResult, nodeTypes]
  )

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
          name: 'Example Workflow',
          active: false,
          nodes: [
            {
              id: 'trigger-1',
              type: 'default',
              data: { label: 'Start Trigger', type: 'trigger', color: '#E74C3C', status: 'pending' },
              position: { x: 100, y: 50 },
            },
            {
              id: 'http-1',
              type: 'default',
              data: { label: 'Fetch Data', type: 'http', color: '#3498DB', status: 'pending' },
              position: { x: 400, y: 50 },
            },
            {
              id: 'ai-1',
              type: 'default',
              data: { label: 'Process AI', type: 'ai', color: '#9B59B6', status: 'pending' },
              position: { x: 700, y: 50 },
            },
          ],
          edges: [
            { id: 'edge-1', source: 'trigger-1', target: 'http-1', animated: true, type: 'smoothstep', style: { stroke: '#7c4dff', strokeWidth: 2 } },
            { id: 'edge-2', source: 'http-1', target: 'ai-1', animated: true, type: 'smoothstep', style: { stroke: '#7c4dff', strokeWidth: 2 } },
          ],
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
      const nodeStatus = nodeLog?.status || 'pending'
      return {
        ...node,
        data: {
          ...node.data,
          status: nodeStatus as 'pending' | 'running' | 'completed' | 'failed',
        },
      }
    })

    if (JSON.stringify(updatedNodes) !== JSON.stringify(workflow.nodes)) {
      setWorkflow({
        ...workflow,
        nodes: updatedNodes,
      })
    }
  }, [executionLogs, workflow, setWorkflow])

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
      <div className="fixed inset-0 text-white flex flex-col" style={{
        position: 'fixed',
        inset: '0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgb(var(--color-base-100))',
        color: 'rgb(var(--color-base-700))',
      }}>
        {/* Top Toolbar */}
        <div className="h-16 border-b flex items-center px-4 gap-4 z-40 flex-shrink-0" style={{
          backgroundColor: 'rgb(var(--color-base-200))',
          borderColor: 'rgb(var(--color-base-300))',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded transition"
            style={{
              color: 'rgb(var(--color-primary-400))',
              backgroundColor: 'rgba(var(--color-primary-400) / 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-400) / 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-400) / 0.1)'
            }}
            title={sidebarOpen ? 'Close panel' : 'Open panel'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <WorkflowToolbar />
          </div>

          <div className="text-xs" style={{
            color: 'rgb(var(--color-base-400))',
          }}>
            {workflow?.nodes?.length || 0} nodes
          </div>
        </div>

        {/* Main Content - Canvas + Execution Panel */}
        <div className="flex-1 overflow-hidden flex flex-row min-h-0" style={{
          flex: '1 1 0%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '0',
          backgroundColor: 'rgb(var(--color-base-100))',
        }}>
          {/* Sidebar - Left Panel */}
          <div
            className={`border-r shadow-lg transition-all duration-300 overflow-y-auto flex-shrink-0 min-h-0 ${
              sidebarOpen ? 'w-80' : 'w-0'
            }`}
            style={{
              backgroundColor: 'rgb(var(--color-base-200))',
              borderColor: 'rgb(var(--color-base-300))',
              width: sidebarOpen ? '320px' : '0',
            }}
          >
            {sidebarOpen && (
              <div className="p-4">
                <h3 className="font-bold text-sm uppercase mb-4" style={{
                  color: 'rgb(var(--color-base-500))',
                }}>
                  Node Library
                </h3>
                <p className="text-xs mb-4" style={{
                  color: 'rgb(var(--color-base-400))',
                }}>
                  Drag components to canvas
                </p>
                <NodePalette />
              </div>
            )}
          </div>

          {/* Center - Canvas + Execution */}
          <div className="flex-1 overflow-hidden flex flex-col relative min-h-0" style={{
            flex: '1 1 0%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: '0',
          }}>
            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative min-h-0" style={{
              flex: '1 1 0%',
              overflow: 'hidden',
              position: 'relative',
              minHeight: '0',
            }}>
              {workflow ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <WorkflowCanvas />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Workflow</h2>
                    <p style={{ color: 'rgb(var(--color-base-400))' }}>Create a new workflow to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Execution Timeline Panel */}
            <div
              className="border-t transition-all duration-300 flex-shrink-0"
              style={{
                backgroundColor: 'rgb(var(--color-base-200))',
                borderColor: 'rgb(var(--color-base-300))',
                height: executionPanelOpen ? '200px' : '40px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExecutionPanelOpen(!executionPanelOpen)}
                className="w-full h-10 flex items-center justify-between px-4 hover:bg-opacity-50 transition"
                style={{ backgroundColor: 'rgb(var(--color-base-300))' }}
              >
                <span className="text-xs font-semibold text-gray-400 uppercase">Execution Logs</span>
                {executionPanelOpen ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronUp size={16} className="text-gray-400" />
                )}
              </button>
              {executionPanelOpen && (
                <div style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
                  <ExecutionTimeline />
                </div>
              )}
            </div>

          </div>

          {/* Right Panel - DESIGN.md style (Stitch) */}
          <div className="flex-shrink-0 flex flex-col border-l overflow-hidden" style={{
            width: '280px',
            backgroundColor: 'rgb(var(--color-base-200))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0" style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '18px' }}>⚙️</span>
                <span className="text-sm font-semibold" style={{
                  color: 'rgb(var(--color-base-700))',
                }}>workflow.md</span>
              </div>
              {selectedNodeId && (
                <button
                  onClick={() => {}}
                  className="p-1 hover:bg-white/10 rounded transition text-sm"
                  style={{ color: 'rgb(var(--color-base-400))' }}
                  title="Close"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Body - List of nodes / Config */}
            <div className="flex-1 overflow-y-auto">
              {selectedNodeId && workflow?.nodes ? (
                <div className="p-3">
                  <div className="text-xs font-semibold mb-3" style={{
                    color: 'rgb(var(--color-base-400))',
                    textTransform: 'uppercase',
                  }}>Node Configuration</div>
                  <NodeConfigPanel nodeId={selectedNodeId} />
                </div>
              ) : workflow?.nodes && workflow.nodes.length > 0 ? (
                <div className="p-3 space-y-2">
                  {workflow.nodes.map((node: any) => (
                    <button
                      key={node.id}
                      onClick={() => {}}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/5 transition text-left"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>Aa</span>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: node.data?.color || '#8B5CF6' }}
                      />
                      <span className="text-xs flex-1 text-white/80" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {node.data?.label || 'Node'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>▷</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <div className="text-xs text-white/40 mb-3">No workflow loaded</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t flex flex-col gap-2 p-3 flex-shrink-0" style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}>
              <button className="flex items-center gap-2 px-3 py-2 rounded text-xs hover:bg-white/5 transition text-white/70">
                <span>+</span>
                <span>Start with your design</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded text-xs hover:bg-white/5 transition text-white/70">
                <span>+</span>
                <span>Create new</span>
              </button>
            </div>
          </div>

          {/* Right Tool Strip (vertical icons) */}
          <div className="flex-shrink-0 flex flex-col items-center justify-start border-l" style={{
            width: '48px',
            backgroundColor: 'rgb(var(--color-base-200))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            paddingTop: '12px',
            gap: '8px',
          }}>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Select">
              ↗
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Box select">
              □
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Edit">
              ✏
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Pan">
              👋
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Frame">
              🖼
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Settings">
              ⚙
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded hover:bg-white/10 transition text-white/50 hover:text-white/70" title="Star">
              ★
            </button>
          </div>
        </div>
        {/* Search Dialog */}
        <SearchDialog
          isOpen={searchOpen}
          query={query}
          results={results}
          selectedIndex={selectedIndex}
          isLoading={searchLoading}
          history={history}
          onQueryChange={handleSearch}
          onClearQuery={clearQuery}
          onSelectResult={handleSelectSearchResult}
          onClose={closeSearch}
          onNavigate={handleNavigate}
          onClearHistory={clearHistory}
        />
      </div>
    </ReactFlowProvider>
  )
}

export default function App() {
  return (
    <WorkflowProvider>
      <ExecutionProvider>
        <AppContent />
      </ExecutionProvider>
    </WorkflowProvider>
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
