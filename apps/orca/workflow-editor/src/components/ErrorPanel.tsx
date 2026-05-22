import { useState } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { ValidationIssue } from '../utils/workflowValidation'

interface ErrorPanelProps {
  errors?: ValidationIssue[]
  warnings?: ValidationIssue[]
  onDismiss?: () => void
  compact?: boolean
}

/**
 * Panel for displaying validation errors and warnings
 * Can be used in modal, sidebar, or inline
 */
export default function ErrorPanel({
  errors = [],
  warnings = [],
  onDismiss,
  compact = false,
}: ErrorPanelProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (errors.length === 0 && warnings.length === 0)) {
    return null
  }

  const hasErrors = errors.length > 0

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (compact) {
    return (
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: hasErrors
            ? 'rgba(237, 49, 93, 0.1)'
            : 'rgba(255, 193, 7, 0.1)',
          border: `1px solid ${hasErrors ? 'rgb(237, 49, 93)' : 'rgb(255, 193, 7)'}`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        {hasErrors ? (
          <AlertCircle size={14} color="rgb(237, 49, 93)" />
        ) : (
          <AlertTriangle size={14} color="rgb(255, 193, 7)" />
        )}
        <span style={{ color: 'var(--stitch-text)', flex: 1 }}>
          {hasErrors
            ? `${errors.length} error${errors.length !== 1 ? 's' : ''}`
            : `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--stitch-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'rgb(var(--color-base-100))',
        border: '1px solid var(--stitch-border)',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: errors.length > 0 || warnings.length > 0 ? '12px' : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasErrors ? (
            <AlertCircle size={18} color="rgb(237, 49, 93)" />
          ) : (
            <AlertTriangle size={18} color="rgb(255, 193, 7)" />
          )}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--stitch-text)',
              margin: 0,
            }}
          >
            {hasErrors ? 'Validation Errors' : 'Warnings'}
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--stitch-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--stitch-text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--stitch-muted)'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginBottom: warnings.length > 0 ? '12px' : 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgb(237, 49, 93)',
              marginBottom: '8px',
            }}
          >
            {errors.length} Error{errors.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {errors.map((error, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(237, 49, 93, 0.05)',
                  border: '1px solid rgba(237, 49, 93, 0.2)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--stitch-text)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      color: 'rgb(237, 49, 93)',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {error.field}:
                  </span>
                  <span>{error.message}</span>
                </div>
                {error.nodeId && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--stitch-muted)',
                      marginTop: '4px',
                    }}
                  >
                    Node: {error.nodeId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgb(255, 193, 7)',
              marginBottom: '8px',
            }}
          >
            {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(255, 193, 7, 0.05)',
                  border: '1px solid rgba(255, 193, 7, 0.2)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--stitch-text)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      color: 'rgb(255, 193, 7)',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {warning.field}:
                  </span>
                  <span>{warning.message}</span>
                </div>
                {warning.nodeId && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--stitch-muted)',
                      marginTop: '4px',
                    }}
                  >
                    Node: {warning.nodeId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
