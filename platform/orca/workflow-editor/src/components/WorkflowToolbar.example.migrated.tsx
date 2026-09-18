import { useRef, useState } from 'react'
import { useWorkflowOperations, useExecutionOperations, useWorkflowHistory } from '../hooks'
import { useErrorRecovery } from '../hooks'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import { runWorkflow, exportWorkflow } from '../api/orcaApi'
import { Menu, Play, Share2, Globe, Network, Smartphone, Bot, ChevronDown } from 'lucide-react'
import ToggleGroup from './ui/ToggleGroup'
import ThemeSelector from './ui/ThemeSelector'
import type { AppMode } from '../types/modes'

interface UserProfile {
  name: string
  email: string
  avatar?: string
}

/**
 * WorkflowToolbar - MIGRATION EXAMPLE
 * 
 * Changes from old pattern:
 * - useExecutionStatus() → useExecutionOperations() for dispatch methods
 * - Added useWorkflowHistory() for undo/redo button states
 * - Added useErrorRecovery() for error handling
 * - Proper hook usage with correct method names
 */
export default function WorkflowToolbarMigrated({
  activeMode = 'workflow',
  onModeChange = () => {},
}: {
  activeMode?: AppMode
  onModeChange?: (mode: AppMode) => void
}) {
  const { state: workflowState, setWorkflow } = useWorkflowOperations()
  const { startExecution, completeExecution } = useExecutionOperations()
  const { undo, redo, canUndo, canRedo } = useWorkflowHistory()
  const { addError } = useErrorRecovery()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Mock user profile - in a real app, this would come from authentication
  const userProfile: UserProfile = {
    name: 'Joel Stalin Martinez',
    email: 'joelstalin2105@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocI3dGr3C1tHAi1YjmDNgQUTY5TVUi6ukUCFQ9RmSP5sJX0i0Z9y=s96'
  }

  // Check if project exists
  const hasProject = !!workflowState.workflow && workflowState.workflow.nodes && workflowState.workflow.nodes.length > 0

  const handleExport = async () => {
    if (!workflowState.workflow) return
    setIsLoading(true)
    try {
      const blob = await exportWorkflow(workflowState.workflow.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflowState.workflow.name}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast('Workflow exported successfully', 'success')
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      const { message } = handleApiError(err)
      addError(err, 'WorkflowToolbar.Export')
      addToast(`Export failed: ${message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunWorkflow = async () => {
    if (!workflowState.workflow) {
      addToast('No workflow to run', 'error')
      return
    }

    setIsLoading(true)
    try {
      // Start execution in context
      const executionId = `exec-${Date.now()}`
      startExecution(executionId, workflowState.workflow.id)

      // Run the workflow via API
      const result = await runWorkflow(workflowState.workflow.id)

      // Update execution status
      completeExecution(result.status === 'success' ? 'completed' : 'failed')

      addToast(
        result.status === 'success'
          ? 'Workflow executed successfully'
          : 'Workflow execution failed',
        result.status === 'success' ? 'success' : 'error'
      )
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      const { message } = handleApiError(err)
      addError(err, 'WorkflowToolbar.Execute', true)
      completeExecution('failed')
      addToast(`Execution failed: ${message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = () => {
    if (canUndo) {
      undo()
      addToast('Undo', 'info')
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      redo()
      addToast('Redo', 'info')
    }
  }

  return (
    <div className="orca-toolbar">
      <div className="orca-toolbar__left">
        <button
          className="orca-toolbar__button orca-toolbar__button--icon"
          title="Menu"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="orca-toolbar__center">
        <button
          disabled={!canUndo}
          onClick={handleUndo}
          title="Undo"
          className="orca-toolbar__button orca-toolbar__button--secondary"
        >
          ↶
        </button>
        <button
          disabled={!canRedo}
          onClick={handleRedo}
          title="Redo"
          className="orca-toolbar__button orca-toolbar__button--secondary"
        >
          ↷
        </button>
        <ToggleGroup
          value={activeMode}
          onChange={onModeChange}
          items={[
            { id: 'workflow', label: 'Workflow', icon: <Network size={14} /> },
            { id: 'web', label: 'Web', icon: <Globe size={14} /> },
            { id: 'mobile', label: 'Mobile', icon: <Smartphone size={14} /> },
            { id: 'ai', label: 'AI', icon: <Bot size={14} /> },
          ]}
        />
      </div>

      <div className="orca-toolbar__right">
        <button
          disabled={!hasProject || isLoading}
          onClick={handleRunWorkflow}
          className="orca-toolbar__button orca-toolbar__button--primary"
          title="Run workflow"
        >
          <Play size={16} />
          Run
        </button>
        <button
          disabled={!hasProject || isLoading}
          onClick={handleExport}
          className="orca-toolbar__button orca-toolbar__button--secondary"
          title="Export workflow"
        >
          <Share2 size={16} />
          Export
        </button>
        <ThemeSelector />
        <div style={{ position: 'relative' }}>
          <button
            className="orca-toolbar__button orca-toolbar__button--icon"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Profile"
          >
            <img
              src={userProfile.avatar}
              alt="Profile"
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
            <ChevronDown size={12} />
          </button>
          {showProfileMenu && (
            <div ref={profileMenuRef} className="orca-toolbar__profile-menu">
              <div className="orca-toolbar__profile-header">
                <img src={userProfile.avatar} alt="Profile" />
                <div>
                  <div className="orca-toolbar__profile-name">{userProfile.name}</div>
                  <div className="orca-toolbar__profile-email">{userProfile.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
