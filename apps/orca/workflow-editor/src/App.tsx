import { useState, useEffect, useCallback } from 'react'
import '@xyflow/react/dist/style.css'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowCanvas from './components/WorkflowCanvas'
import WorkflowToolbar from './components/WorkflowToolbar'
import SearchDialog from './components/Search/SearchDialog'
import FloatingWindow from './components/FloatingWindow'
import FloatingComponentsPanel from './components/FloatingComponentsPanel'
import FloatingChatPanel from './components/FloatingChatPanel'
import FloatingPropertiesPanel from './components/FloatingPropertiesPanel'
import CollapsedCategoryBar from './components/CollapsedCategoryBar'
import QuickAccessBar from './components/QuickAccessBar'
import AgentLogButton from './components/AgentLogButton'
import EditorToolsPanel from './components/EditorToolsPanel'
import ToastContainer from './components/ToastContainer'
import MiniZoom from './components/MiniZoom'
import WorkflowVersionManager from './components/WorkflowVersionManager'
import WorkflowAnalyticsDashboard from './components/WorkflowAnalyticsDashboard'
import { WorkflowProvider } from './contexts/WorkflowContext'
import { ExecutionProvider } from './contexts/ExecutionContext'
import { WindowProvider, useWindows } from './contexts/WindowContext'
import { ToastProvider } from './contexts/ToastContext'
import { useWorkflowOperations } from './hooks/useWorkflowOperations'
import { useExecutionStatus } from './hooks/useExecutionStatus'
import { useSearch } from './hooks/useSearch'
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { useClipboard } from './hooks/useClipboard'
import { useMultiSelect } from './hooks/useMultiSelect'
import { addToRecent } from './utils/search/searchHistory'

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'canvas' | 'properties' | 'version'>('canvas')
  const [nodeTypes, setNodeTypes] = useState<Record<string, any>>({})
  const [miniZoomEnabled, setMiniZoomEnabled] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const { workflow, setWorkflow, addNode, deleteNode, selectedNodeId } = useWorkflowOperations()
  const { updateWindow } = useWindows()
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

  // Show/hide properties panel when node is selected/deselected
  useEffect(() => {
    updateWindow('properties', { isVisible: !!selectedNodeId })
  }, [selectedNodeId, updateWindow])

  // Setup keyboard shortcuts
  useKeyboardShortcuts([{ ...SHORTCUTS.SEARCH, callback: openSearch }])

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
          const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId)
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
          const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId)
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
          multiSelect.selectAll(workflow.nodes.map((n) => n.id))
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
            {
              id: 'edge-1',
              source: 'trigger-1',
              target: 'http-1',
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#7c4dff', strokeWidth: 2 },
            },
            {
              id: 'edge-2',
              source: 'http-1',
              target: 'ai-1',
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#7c4dff', strokeWidth: 2 },
            },
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
      const nodeLog = executionLogs.find((log) => log.nodeId === node.id || log.node_id === node.id)
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
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgb(var(--color-base-100))',
          color: 'var(--stitch-text)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            background: 'radial-gradient(circle at 50% 50%, rgb(124, 77, 255), transparent)',
            animation: 'pulse 4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <style>{`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.05;
            }
            50% {
              opacity: 0.15;
            }
          }

          @keyframes loadingBar {
            0% {
              width: 0;
            }
            100% {
              width: 100%;
            }
          }
        `}</style>

        <div
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              marginBottom: '32px',
              animation: 'fadeInDown 0.8s ease-out',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgb(124, 77, 255), rgb(74, 158, 255))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 8px 32px rgba(124, 77, 255, 0.3)',
              }}
            >
              ◇
            </div>
          </div>

          {/* Main text */}
          <div
            style={{
              marginBottom: '8px',
              fontSize: '28px',
              fontWeight: 600,
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
            }}
          >
            ORCA Orchestrator
          </div>

          {/* Subtitle */}
          <div
            style={{
              marginBottom: '32px',
              color: 'var(--stitch-muted)',
              fontSize: '14px',
              animation: 'fadeInUp 0.8s ease-out 0.4s both',
            }}
          >
            Initializing workflow editor
          </div>

          {/* Loading bar */}
          <div
            style={{
              width: '240px',
              height: '3px',
              backgroundColor: 'rgba(74, 158, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              animation: 'fadeInUp 0.8s ease-out 0.6s both',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgb(74, 158, 255), transparent)',
                animation: 'loadingBar 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Loading status text */}
          <div
            style={{
              marginTop: '24px',
              fontSize: '12px',
              color: 'var(--stitch-muted)',
              animation: 'fadeInUp 0.8s ease-out 0.8s both',
            }}
          >
            Loading components...
          </div>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgb(var(--color-base-100))',
          color: 'var(--stitch-text)',
        }}
      >
        {/* Top Bar */}
        <WorkflowToolbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Canvas Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {workflow ? (
            <WorkflowCanvas />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                  No Workflow
                </h2>
                <p style={{ color: 'var(--stitch-muted)' }}>Create a new workflow to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Windows */}
        <FloatingWindowsManager />

        {/* Quick Access Bar */}
        <QuickAccessBar
          searchOpen={searchOpen}
          onSearchToggle={() => searchOpen ? closeSearch() : openSearch()}
          miniZoomEnabled={miniZoomEnabled}
          onMiniZoomToggle={() => setMiniZoomEnabled(!miniZoomEnabled)}
        />

        {/* Editor Tools Panel */}
        <EditorToolsPanel />

        {/* Agent Log Button */}
        <AgentLogButton />

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

        {/* Toast Container */}
        <ToastContainer />

        {/* Mini Zoom */}
        <MiniZoom enabled={miniZoomEnabled} zoom={2} size={160} />
      </div>
    </ReactFlowProvider>
  )
}

function FloatingWindowsManager() {
  const { windows, updateWindow } = useWindows()
  const componentsWindow = windows.find((w) => w.type === 'components')

  return (
    <>
      {windows.map((window) => {
        if (!window.isVisible) return null

        if (window.type === 'components') {
          return (
            <FloatingWindow
              key={window.id}
              window={window}
              onMinimize={() => updateWindow(window.id, { isVisible: false })}
            >
              <FloatingComponentsPanel />
            </FloatingWindow>
          )
        }

        if (window.type === 'chat') {
          return (
            <FloatingWindow key={window.id} window={window}>
              <FloatingChatPanel />
            </FloatingWindow>
          )
        }

        if (window.type === 'properties') {
          return (
            <FloatingWindow key={window.id} window={window}>
              <FloatingPropertiesPanel />
            </FloatingWindow>
          )
        }

        if (window.type === 'versions') {
          return (
            <FloatingWindow key={window.id} window={window}>
              <WorkflowVersionManager workflowId={workflow?.id || null} currentWorkflow={workflow} />
            </FloatingWindow>
          )
        }

        if (window.type === 'analytics') {
          return (
            <FloatingWindow key={window.id} window={window}>
              <WorkflowAnalyticsDashboard workflow={workflow} />
            </FloatingWindow>
          )
        }

        return null
      })}

      {/* Show category bar when components window is hidden */}
      {componentsWindow && !componentsWindow.isVisible && (
        <CollapsedCategoryBar
          x={componentsWindow.x + 8}
          y={componentsWindow.y}
          height={componentsWindow.height}
          onExpand={() => {
            updateWindow(componentsWindow.id, { isVisible: true })
          }}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <WorkflowProvider>
        <ExecutionProvider>
          <WindowProvider>
            <AppContent />
          </WindowProvider>
        </ExecutionProvider>
      </WorkflowProvider>
    </ToastProvider>
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
