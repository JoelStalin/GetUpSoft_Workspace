import { useRef, useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import {
  createWorkflow,
  exportWorkflow,
  importWorkflow,
  runWorkflow,
} from '../api/orcaApi'
import GenerateModal from './GenerateModal'

export default function WorkflowToolbar() {
  const workflow = useWorkflowStore((state) => state.workflow)
  const setWorkflow = useWorkflowStore((state) => state.setWorkflow)
  const setCurrentExecutionId = useWorkflowStore((state) => state.setCurrentExecutionId)
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
      alert('Failed to save: ' + error)
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
      alert('Failed to export: ' + error)
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
      alert('Failed to import: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRun = async () => {
    if (!workflow) return
    setIsLoading(true)
    try {
      const result = await runWorkflow(workflow.id)
      setCurrentExecutionId(result.execution_id)
      console.log('Workflow execution started:', result.execution_id)
    } catch (error) {
      alert('Failed to run: ' + error)
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
