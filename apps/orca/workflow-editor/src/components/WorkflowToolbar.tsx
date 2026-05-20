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
      alert('Workflow execution started: ' + result.execution_id)
    } catch (error) {
      alert('Failed to run: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="border-b border-gray-700 bg-[#1a1b1e] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">
              {workflow?.name || 'Workflow Editor'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-[#7c4dff] hover:bg-[#6a3ecc] rounded text-white text-sm font-medium transition disabled:opacity-50"
              disabled={isLoading}
            >
              ✨ Generate
            </button>

            <button
              onClick={handleImport}
              className="px-4 py-2 bg-[#1a9ba1] hover:bg-[#157d88] rounded text-white text-sm font-medium transition disabled:opacity-50"
              disabled={isLoading}
            >
              📥 Import
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#10ac84] hover:bg-[#0d956f] rounded text-white text-sm font-medium transition disabled:opacity-50"
              disabled={!workflow || isLoading}
            >
              📥 Export
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#10ac84] hover:bg-[#0d956f] rounded text-white text-sm font-medium transition disabled:opacity-50"
              disabled={!workflow || isLoading}
            >
              💾 Save
            </button>

            <button
              onClick={handleRun}
              className="px-4 py-2 bg-[#ff9f43] hover:bg-[#e68a33] rounded text-white text-sm font-medium transition disabled:opacity-50"
              disabled={!workflow || isLoading}
            >
              ▶️ Run
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
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
