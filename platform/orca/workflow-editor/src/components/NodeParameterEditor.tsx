'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Plus, Trash2, Edit2 } from 'lucide-react'
import { WorkflowNode } from '../types/workflow'

interface Parameter {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required?: boolean
  description?: string
}

interface NodeParameterEditorProps {
  node: WorkflowNode | null
  onParametersChange?: (parameters: Record<string, any>) => void
}

/**
 * Visual editor for node parameters
 * Allows users to configure node settings without code
 */
export default function NodeParameterEditor({
  node,
  onParametersChange,
}: NodeParameterEditorProps) {
  const [expandedParams, setExpandedParams] = useState<Set<string>>(new Set())
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [newParamKey, setNewParamKey] = useState('')
  const [newParamType, setNewParamType] = useState<Parameter['type']>('string')

  // Load parameters from node
  useMemo(() => {
    if (!node?.data?.parameters) {
      setParameters([])
      return
    }

    const params: Parameter[] = Object.entries(node.data.parameters).map(([key, value]) => ({
      key,
      value,
      type: inferType(value),
    }))
    setParameters(params)
  }, [node])

  const handleParameterChange = (key: string, newValue: any) => {
    const updated = parameters.map((p) =>
      p.key === key ? { ...p, value: newValue } : p
    )
    setParameters(updated)

    // Notify parent
    const paramObj = updated.reduce((acc, p) => {
      acc[p.key] = p.value
      return acc
    }, {} as Record<string, any>)
    onParametersChange?.(paramObj)
  }

  const handleAddParameter = () => {
    if (!newParamKey.trim()) {
      return
    }

    const newParam: Parameter = {
      key: newParamKey,
      value: getDefaultValue(newParamType),
      type: newParamType,
    }

    setParameters([...parameters, newParam])
    setNewParamKey('')
    setNewParamType('string')
  }

  const handleDeleteParameter = (key: string) => {
    setParameters(parameters.filter((p) => p.key !== key))
  }

  if (!node) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--stitch-muted)',
        }}
      >
        Select a node to edit parameters
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--stitch-text)',
          }}
        >
          Node Parameters: {node.data.label || node.id}
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--stitch-muted)' }}>
          Configure node settings
        </p>
      </div>

      {/* Parameters List */}
      {parameters.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {parameters.map((param) => (
            <ParameterRow
              key={param.key}
              param={param}
              isExpanded={expandedParams.has(param.key)}
              onToggleExpand={() => {
                const newExpanded = new Set(expandedParams)
                if (newExpanded.has(param.key)) {
                  newExpanded.delete(param.key)
                } else {
                  newExpanded.add(param.key)
                }
                setExpandedParams(newExpanded)
              }}
              onChange={(newValue) => handleParameterChange(param.key, newValue)}
              onDelete={() => handleDeleteParameter(param.key)}
            />
          ))}
        </div>
      )}

      {/* Add New Parameter */}
      <div
        style={{
          padding: '12px',
          border: '1px solid var(--stitch-border)',
          borderRadius: '6px',
          backgroundColor: 'rgba(var(--color-primary-400), 0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Parameter name"
            value={newParamKey}
            onChange={(e) => setNewParamKey(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddParameter()
              }
            }}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid var(--stitch-border)',
              borderRadius: '4px',
              backgroundColor: 'rgb(var(--color-base-100))',
              color: 'var(--stitch-text)',
              fontSize: '12px',
            }}
          />
          <select
            value={newParamType}
            onChange={(e) => setNewParamType(e.target.value as Parameter['type'])}
            style={{
              padding: '6px 8px',
              border: '1px solid var(--stitch-border)',
              borderRadius: '4px',
              backgroundColor: 'rgb(var(--color-base-100))',
              color: 'var(--stitch-text)',
              fontSize: '12px',
            }}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
            <option value="object">Object</option>
          </select>
          <button
            onClick={handleAddParameter}
            disabled={!newParamKey.trim()}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgb(var(--color-primary-400))',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: newParamKey.trim() ? 1 : 0.5,
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Empty State */}
      {parameters.length === 0 && (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--stitch-muted)',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(var(--color-base-400), 0.2)',
          }}
        >
          No parameters configured. Add one above to get started.
        </div>
      )}
    </div>
  )
}

/**
 * Individual parameter row
 */
function ParameterRow({
  param,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
}: {
  param: Parameter
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (value: any) => void
  onDelete: () => void
}) {
  return (
    <div
      style={{
        border: '1px solid var(--stitch-border)',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(var(--color-base-300), 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
        onClick={onToggleExpand}
      >
        <ChevronDown
          size={14}
          style={{
            transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--stitch-text)', flex: 1 }}>
          {param.key}
        </span>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: 'rgba(var(--color-primary-400), 0.2)',
            color: 'rgb(var(--color-primary-400))',
          }}
        >
          {param.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
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
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--stitch-border)' }}>
          <ParameterInput
            type={param.type}
            value={param.value}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Parameter input based on type
 */
function ParameterInput({
  type,
  value,
  onChange,
}: {
  type: Parameter['type']
  value: any
  onChange: (value: any) => void
}) {
  switch (type) {
    case 'string':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--stitch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgb(var(--color-base-100))',
            color: 'var(--stitch-text)',
            fontSize: '12px',
          }}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--stitch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgb(var(--color-base-100))',
            color: 'var(--stitch-text)',
            fontSize: '12px',
          }}
        />
      )
    case 'boolean':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--stitch-text)' }}>
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      )
    case 'array':
      return (
        <textarea
          value={JSON.stringify(value || [], null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch (e) {
              console.error('Invalid JSON')
            }
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--stitch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgb(var(--color-base-100))',
            color: 'var(--stitch-text)',
            fontSize: '12px',
            fontFamily: 'monospace',
            minHeight: '100px',
            resize: 'vertical',
          }}
        />
      )
    case 'object':
      return (
        <textarea
          value={JSON.stringify(value || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch (e) {
              console.error('Invalid JSON')
            }
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--stitch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgb(var(--color-base-100))',
            color: 'var(--stitch-text)',
            fontSize: '12px',
            fontFamily: 'monospace',
            minHeight: '100px',
            resize: 'vertical',
          }}
        />
      )
    default:
      return null
  }
}

/**
 * Infer parameter type from value
 */
function inferType(value: any): Parameter['type'] {
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'string'
}

/**
 * Get default value for parameter type
 */
function getDefaultValue(type: Parameter['type']): any {
  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}
