import { useRef, useState } from 'react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useExecutionStatus } from '../hooks/useExecutionStatus'
import { useWorkflowExecution } from '../hooks/useWorkflowExecution'
import { handleApiError } from '../utils/errorHandler'
import { runWorkflow, exportWorkflow } from '../api/orcaApi'
import { Menu, Play, Share2, Download, Globe, Network, Smartphone } from 'lucide-react'

export default function WorkflowToolbar({
  activeTab = 'canvas',
  onTabChange = () => {},
}: {
  activeTab?: 'canvas' | 'properties' | 'version'
  onTabChange?: (tab: 'canvas' | 'properties' | 'version') => void
}) {
  const { workflow } = useWorkflowOperations()
  const { setCurrentExecution, setIsExecuting } = useExecutionStatus()
  const { simulateExecution } = useWorkflowExecution()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      console.warn('Cannot run: no nodes in workflow')
      return
    }

    setIsLoading(true)
    setIsExecuting(true)

    try {
      const result = await runWorkflow(workflow.id)
      setCurrentExecution(result.execution_id)
      console.log('Workflow execution started:', result.execution_id)
    } catch (error) {
      console.log('API execution failed, using simulated execution')
      const nodeIds = workflow.nodes.map((n) => n.id)
      await simulateExecution(nodeIds, { delayBetweenNodes: 1500 })
      setIsExecuting(false)
    } finally {
      setIsLoading(false)
    }
  }

  const modes = [
    { id: 'canvas' as const, label: 'Web Design', icon: Globe },
    { id: 'properties' as const, label: 'Workflow', icon: Network },
    { id: 'version' as const, label: 'Mobile Design', icon: Smartphone },
  ]

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
        {/* Left Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '200px',
          }}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--stitch-muted)'
              e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--stitch-text)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Menu size={16} />
          </button>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--stitch-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            ORCA
          </div>

          {workflow && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                backgroundColor: 'var(--stitch-hover)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--stitch-muted)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--stitch-accent)',
                  flexShrink: 0,
                }}
              />
              {workflow.name || 'Untitled'}
            </div>
          )}
        </div>

        {/* Center Section - Design Modes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => onTabChange(mode.id)}
                title={mode.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: activeTab === mode.id ? 'rgba(74, 158, 255, 0.15)' : 'transparent',
                  border: `1.5px solid ${activeTab === mode.id ? 'var(--stitch-accent)' : 'var(--stitch-border)'}`,
                  color: activeTab === mode.id ? 'var(--stitch-accent)' : 'var(--stitch-muted)',
                  fontWeight: activeTab === mode.id ? 600 : 400,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== mode.id) {
                    e.currentTarget.style.borderColor = 'var(--stitch-accent)'
                    e.currentTarget.style.color = 'var(--stitch-accent)'
                    e.currentTarget.style.backgroundColor = 'rgba(74, 158, 255, 0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== mode.id) {
                    e.currentTarget.style.borderColor = 'var(--stitch-border)'
                    e.currentTarget.style.color = 'var(--stitch-muted)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon size={14} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => console.log('Share functionality coming soon')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              border: `1px solid var(--stitch-border)`,
              color: 'var(--stitch-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
              e.currentTarget.style.color = 'var(--stitch-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
              e.currentTarget.style.color = 'var(--stitch-muted)'
            }}
          >
            <Share2 size={14} />
          </button>

          <button
            onClick={handleRun}
            disabled={!workflow || isLoading}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: workflow ? 'var(--stitch-green)' : 'rgba(29, 185, 84, 0.3)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: workflow && !isLoading ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (workflow && !isLoading) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              if (workflow && !isLoading) {
                e.currentTarget.style.opacity = '1'
              }
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
        style={{ display: 'none' }}
      />
    </>
  )
}
