'use client'

import { useState } from 'react'
import { Download, FileJson, FileText, Image } from 'lucide-react'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useWorkflowPersistence } from '../hooks/useWorkflowPersistence'
import { useToast } from '../contexts/ToastContext'

interface ExportFormat {
  id: 'json' | 'yaml' | 'image'
  label: string
  description: string
  icon: typeof FileJson
  mimeType: string
}

/**
 * Dialog for exporting workflows in multiple formats
 */
export default function ExportWorkflowDialog({
  onClose,
  isOpen = false,
}: {
  onClose: () => void
  isOpen?: boolean
}) {
  const { workflow } = useWorkflowOperations()
  const { exportWorkflow } = useWorkflowPersistence()
  const { addToast } = useToast()
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'yaml' | 'image'>('json')
  const [isExporting, setIsExporting] = useState(false)

  const formats: ExportFormat[] = [
    {
      id: 'json',
      label: 'JSON',
      description: 'Universal format - import to other tools',
      icon: FileJson,
      mimeType: 'application/json',
    },
    {
      id: 'yaml',
      label: 'YAML',
      description: 'Human-readable format - easy to edit',
      icon: FileText,
      mimeType: 'application/x-yaml',
    },
    {
      id: 'image',
      label: 'PNG Image',
      description: 'Visual snapshot - share workflow diagram',
      icon: Image,
      mimeType: 'image/png',
    },
  ]

  const handleExport = async () => {
    if (!workflow) {
      addToast('No workflow to export', 'error')
      return
    }

    setIsExporting(true)

    try {
      if (selectedFormat === 'image') {
        // Export as image (screenshot of canvas)
        exportAsImage()
      } else {
        // Export as JSON or YAML
        const blob = await exportWorkflow(workflow, selectedFormat)
        if (blob) {
          downloadBlob(blob, selectedFormat)
          addToast(`Workflow exported as ${selectedFormat.toUpperCase()}`, 'success')
          onClose()
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      addToast(`Export failed: ${message}`, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadBlob = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow?.name || 'workflow'}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsImage = async () => {
    try {
      const canvas = document.querySelector('.react-flow__viewport') as HTMLElement
      if (!canvas) {
        throw new Error('Canvas not found')
      }

      // Use html2canvas or similar library if available
      // For now, show instruction
      addToast('Image export requires html2canvas library', 'info')
      onClose()
    } catch (error) {
      addToast('Could not export as image', 'error')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'rgb(var(--color-base-100))',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid var(--stitch-border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2
          style={{
            margin: 0,
            marginBottom: '8px',
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--stitch-text)',
          }}
        >
          Export Workflow
        </h2>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: 'var(--stitch-muted)',
          }}
        >
          Choose format to download your workflow
        </p>

        {/* Format Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {formats.map((format) => {
            const Icon = format.icon
            const isSelected = selectedFormat === format.id

            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                style={{
                  padding: '12px 16px',
                  border: `2px solid ${isSelected ? 'rgb(var(--color-primary-400))' : 'var(--stitch-border)'}`,
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(var(--color-primary-400), 0.1)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-400))'
                  e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-400), 0.05)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--stitch-border)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon
                  size={24}
                  color={isSelected ? 'rgb(var(--color-primary-400))' : 'var(--stitch-muted)'}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--stitch-text)',
                    }}
                  >
                    {format.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--stitch-muted)',
                      marginTop: '2px',
                    }}
                  >
                    {format.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* File Info */}
        {workflow && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(var(--color-base-400), 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--stitch-muted)',
              marginBottom: '24px',
            }}
          >
            <div>Workflow: <strong>{workflow.name}</strong></div>
            <div>Nodes: {workflow.nodes?.length || 0}</div>
            <div>Connections: {workflow.edges?.length || 0}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--stitch-border)',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgb(var(--color-primary-400))',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isExporting ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isExporting) {
                e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-500))'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-400))'
            }}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}
