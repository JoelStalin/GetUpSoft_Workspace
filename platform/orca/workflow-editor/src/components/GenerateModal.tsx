import { useState } from 'react'
import { generateWorkflow } from '../api/orcaApi'
import { handleApiError } from '../utils/errorHandler'
import type { Workflow } from '../types/workflow'

interface GenerateModalProps {
  onClose: () => void
  onGenerate: (workflow: Workflow) => void
}

export default function GenerateModal({ onClose, onGenerate }: GenerateModalProps) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kimi-k2-6')
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a workflow description')
      return
    }

    setIsLoading(true)
    try {
      const result = await generateWorkflow(prompt, model, context)

      // Convert API response to Workflow format
      const workflow: Workflow = {
        id: result.workflow_id,
        name: result.name,
        active: false,
        nodes: result.workflow.nodes.map((n: any) => ({
          id: n.id,
          data: {
            label: n.name,
            type: n.type,
            parameters: n.parameters,
          },
          position: { x: n.position[0], y: n.position[1] },
        })),
        edges: [],
        createdAt: result.workflow.createdAt,
        updatedAt: result.workflow.updatedAt,
        orca_meta: result.workflow.orca_meta,
      }

      onGenerate(workflow)
    } catch (error) {
      const { message } = handleApiError(error)
      alert('Failed to generate workflow: ' + message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1b1e] border border-gray-700 rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Generate Workflow</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workflow Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what your workflow should do..."
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white text-sm focus:border-[#7c4dff] focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white text-sm focus:border-[#7c4dff] focus:outline-none"
            >
              <option value="kimi-k2-6">Kimi K2-6</option>
              <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
              <option value="gemma-4-31b-it">Gemma 4 31B IT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Context (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., systems/APIs involved"
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white text-sm focus:border-[#7c4dff] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium transition disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 px-3 py-2 bg-[#7c4dff] hover:bg-[#6a3ecc] rounded text-white text-sm font-medium transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
