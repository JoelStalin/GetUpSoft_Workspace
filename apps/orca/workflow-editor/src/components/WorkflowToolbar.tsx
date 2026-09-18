import { useRef, useState } from 'react'
import { useWorkflowOperations, useExecutionStatus, useExecutionOperations } from '../hooks/useWorkflowOperations'
import { useWorkflowExecution } from '../hooks/useWorkflowExecution'
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
 * MIGRATED: Now uses P2 hooks (useWorkflowOperations, useExecutionStatus, useExecutionOperations)
 */
export default function WorkflowToolbar({
  activeMode = 'workflow',
  onModeChange = () => {},
}: {
  activeMode?: AppMode
  onModeChange?: (mode: AppMode) => void
}) {
  const { workflow } = useWorkflowOperations()
  const executionState = useExecutionStatus()
  const { startExecution, completeExecution } = useExecutionOperations()
  const { simulateExecution } = useWorkflowExecution()
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
  const hasProject = !!workflow && workflow.nodes && workflow.nodes.length > 0

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
      console.error('Export failed:', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRun = async () => {
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
      addToast('No hay nodos en el workflow', 'warning')
      return
    }
    setIsLoading(true)
    try {
      const result = await runWorkflow(workflow.id)
      startExecution(result.execution_id, workflow.id)
      addToast('Workflow execution started', 'success')
    } catch (error) {
      const nodeIds = workflow.nodes.map((n) => n.id)
      await simulateExecution(nodeIds, { delayBetweenNodes: 1500 })
      const { message } = handleApiError(error)
      addToast(`Using simulation: ${message}`, 'info')
    } finally {
      setIsLoading(false)
    }
  }

  // Only show web, workflow, mobile modes if project exists. AI mode always available.
  const modes = [
    ...(hasProject ? [{ id: 'web' as AppMode, label: 'Web Design', icon: <Globe size={14} /> }] : []),
    ...(hasProject ? [{ id: 'workflow' as AppMode, label: 'Workflow', icon: <Network size={14} /> }] : []),
    ...(hasProject ? [{ id: 'mobile' as AppMode, label: 'Mobile Design', icon: <Smartphone size={14} /> }] : []),
    { id: 'ai' as AppMode, label: 'AI', icon: <Bot size={14} /> },
  ]

  // If current mode is not available and project was deleted, switch to AI
  if (activeMode !== 'ai' && !hasProject) {
    onModeChange('ai')
  }

  return (
    <>
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '16px',
          paddingRight: '16px',
          backgroundColor: 'rgb(var(--color-base-100))',
          borderBottom: `1px solid var(--stitch-border)`,
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
          <button
            style={{
              background: 'none', border: 'none', color: 'var(--stitch-text)',
              cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--stitch-muted)'; e.currentTarget.style.backgroundColor = 'var(--stitch-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--stitch-text)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Menu size={16} />
          </button>

          <div className="orca-brand-wordmark">
            ORCA
          </div>

          {workflow && (
            <div className="orca-status-pill">
              <div className="orca-live-dot" />
              {workflow.name || 'Untitled'}
            </div>
          )}
        </div>

        {/* Center — Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <ToggleGroup items={modes} value={activeMode} onChange={onModeChange} />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px', justifyContent: 'flex-end' }}>
          <ThemeSelector />

          <button
            onClick={() => addToast('Share functionality coming soon', 'info')}
            style={{
              padding: '6px 10px', borderRadius: '6px', fontSize: '12px',
              backgroundColor: 'transparent', border: `1px solid var(--stitch-border)`,
              color: 'var(--stitch-muted)', display: 'flex', alignItems: 'center',
              gap: '4px', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-accent)'; e.currentTarget.style.color = 'var(--stitch-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-border)'; e.currentTarget.style.color = 'var(--stitch-muted)' }}
          >
            <Share2 size={14} />
          </button>

          {/* Profile Avatar Button */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: `2px solid var(--stitch-border)`,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-accent)' }}
              onMouseLeave={(e) => { if (!showProfileMenu) e.currentTarget.style.borderColor = 'var(--stitch-border)' }}
              title="Profile Settings"
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--stitch-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'var(--stitch-elevated)',
                border: `1px solid var(--stitch-border)`,
                borderRadius: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                overflow: 'hidden',
              }}>
                {/* User Info */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid var(--stitch-border)`,
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--stitch-text)',
                    marginBottom: '2px',
                  }}>
                    {userProfile.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--stitch-muted)',
                  }}>
                    {userProfile.email}
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    addToast('Profile settings opening...', 'info')
                    setShowProfileMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--stitch-text)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--stitch-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  ⚙️ Configuración de perfil
                </button>

                <button
                  onClick={() => {
                    addToast('Account settings opening...', 'info')
                    setShowProfileMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--stitch-text)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--stitch-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  👤 Mi cuenta
                </button>

                <button
                  onClick={() => {
                    addToast('Preferences opening...', 'info')
                    setShowProfileMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--stitch-text)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--stitch-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  🎨 Preferencias
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--stitch-border)', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    addToast('Sesión cerrada', 'info')
                    setShowProfileMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: '#FF6B6B',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Run button — solo visible en workflow y ai */}
          {(activeMode === 'workflow' || activeMode === 'ai') && (
            <button
              onClick={handleRun}
              disabled={!workflow || isLoading}
              className="orca-run-button"
              style={{ cursor: workflow && !isLoading ? 'pointer' : 'not-allowed', opacity: workflow ? 1 : 0.45 }}
              onMouseEnter={(e) => { if (workflow && !isLoading) e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { if (workflow && !isLoading) e.currentTarget.style.opacity = '1' }}
            >
              <Play size={14} />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} />
    </>
  )
}
