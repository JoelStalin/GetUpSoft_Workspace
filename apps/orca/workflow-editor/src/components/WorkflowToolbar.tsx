import { useRef, useState } from 'react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useWorkflowHistory } from '../hooks/useWorkflowHistory'
import { useExecutionStatus } from '../hooks/useExecutionStatus'
import { useWorkflowExecution } from '../hooks/useWorkflowExecution'
import { handleApiError } from '../utils/errorHandler'
import {
  createWorkflow,
  exportWorkflow,
  importWorkflow,
  runWorkflow,
} from '../api/orcaApi'
import GenerateModal from './GenerateModal'
import { RotateCcw, RotateCw, Wand2, FileUp, Download, Save, Play } from 'lucide-react'

export default function WorkflowToolbar() {
  const { workflow, setWorkflow } = useWorkflowOperations()
  const { canUndo, canRedo, undo, redo } = useWorkflowHistory()
  const { setCurrentExecution, setIsExecuting } = useExecutionStatus()
  const { simulateExecution } = useWorkflowExecution()
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!workflow) return
    setIsLoading(true)
    try {
      await createWorkflow({
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        nodes: workflow.nodes as any,
        connections: {},
        settings: workflow.settings,
      })
      alert('Workflow saved!')
    } catch (error) {
      const { message } = handleApiError(error)
      alert('Failed to save: ' + message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!workflow) return
    setIsLoading(true)
    try {
      const blob = await exportWorkflow(workflow.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflow.name}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      const { message } = handleApiError(error)
      alert('Failed to export: ' + message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      await importWorkflow(file)
      alert('Workflow imported!')
    } catch (error) {
      const { message } = handleApiError(error)
      alert('Failed to import: ' + message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRun = async () => {
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
      alert('Cannot run: no nodes in workflow')
      return
    }

    setIsLoading(true)
    setIsExecuting(true)

    try {
      // Try to run via API first
      const result = await runWorkflow(workflow.id)
      setCurrentExecution(result.execution_id)
      console.log('Workflow execution started:', result.execution_id)
    } catch (error) {
      // Fallback to simulated execution for demo
      console.log('API execution failed, using simulated execution')
      const nodeIds = workflow.nodes.map(n => n.id)
      await simulateExecution(nodeIds, { delayBetweenNodes: 1500 })
      setIsExecuting(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="workflow-toolbar" style={{
        justifyContent: 'space-between',
        backgroundColor: 'rgb(var(--color-base-100))',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}>
        {/* Left: Undo/Redo */}
        <div className="toolbar-group">
          <button
            onClick={undo}
            disabled={!canUndo || isLoading}
            title="Undo (Ctrl+Z)"
            className="toolbar-button"
            style={{
              backgroundColor: canUndo ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
              borderColor: canUndo ? 'rgba(74, 158, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              padding: '6px 8px',
            }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo || isLoading}
            title="Redo (Ctrl+Y)"
            className="toolbar-button"
            style={{
              backgroundColor: canRedo ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
              borderColor: canRedo ? 'rgba(74, 158, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              padding: '6px 8px',
            }}
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Center: Action Pills */}
        <div className="toolbar-group" style={{ gap: '8px' }}>
          <button
            onClick={() => setShowGenerateModal(true)}
            disabled={isLoading}
            title="Generate workflow with AI"
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid',
              color: 'rgb(var(--color-base-700))',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Wand2 size={14} />
            <span>Generate</span>
            <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
          </button>

          <button
            onClick={handleImport}
            disabled={isLoading}
            title="Import workflow from file"
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid',
              color: 'rgb(var(--color-base-700))',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <FileUp size={14} />
            <span>Import</span>
          </button>

          <button
            onClick={handleExport}
            disabled={!workflow || isLoading}
            title="Export workflow to file"
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid',
              color: 'rgb(var(--color-base-700))',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: !workflow ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>

        {/* Right: Save & Run */}
        <div className="toolbar-group" style={{ gap: '8px' }}>
          <button
            onClick={handleSave}
            disabled={!workflow || isLoading}
            title="Save workflow"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid',
              color: 'rgb(var(--color-base-700))',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: !workflow ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Save size={14} />
          </button>

          <button
            onClick={handleRun}
            disabled={!workflow || isLoading}
            title="Run workflow (Ctrl+Enter)"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: 'rgba(15, 163, 136, 0.15)',
              borderColor: 'rgb(15, 163, 136)',
              border: '1px solid',
              color: 'rgb(15, 163, 136)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: !workflow ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 163, 136, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 163, 136, 0.15)'
            }}
          >
            <Play size={14} />
            <span>Run</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="workflow-file-input"
      />

      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={(workflow) => {
            setWorkflow(workflow)
            setShowGenerateModal(false)
          }}
        />
      )}
    </>
  )
}
