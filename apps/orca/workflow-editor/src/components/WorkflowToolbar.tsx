import { useRef, useState } from 'react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
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

export default function WorkflowToolbar() {
  const { workflow, setWorkflow } = useWorkflowOperations()
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
      <div className="workflow-toolbar">
            <button
              onClick={() => setShowGenerateModal(true)}
              disabled={isLoading}
            >
              ✨ Generate
            </button>

            <button
              onClick={handleImport}
              disabled={isLoading}
            >
              📥 Import
            </button>

            <button
              onClick={handleExport}
              disabled={!workflow || isLoading}
            >
              📥 Export
            </button>

            <button
              onClick={handleSave}
              disabled={!workflow || isLoading}
            >
              💾 Save
            </button>

            <button
              onClick={handleRun}
              disabled={!workflow || isLoading}
            >
              ▶️ Run
            </button>
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
