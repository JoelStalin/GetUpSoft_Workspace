import React, { useState } from 'react'
import { Lock, AlertCircle, CheckCircle, Database, Server } from 'lucide-react'

/**
 * Kernel Settings Panel
 * System kernel configuration and credential management
 * Credentials are never displayed in plaintext - always masked
 */

interface KernelConfig {
  id: string
  name: string
  type: 'connection' | 'credential'
  status: 'valid' | 'invalid' | 'unknown'
  isMasked: boolean
  configurable: boolean
}

export function KernelSettingsPanel() {
  const [kernelStatus, setKernelStatus] = useState<'connected' | 'disconnected' | 'error'>(
    'connected'
  )

  const [configs, setConfigs] = useState<KernelConfig[]>([
    {
      id: 'db-conn',
      name: 'Database Connection',
      type: 'connection',
      status: 'valid',
      isMasked: true,
      configurable: false,
    },
    {
      id: 'api-key-orca',
      name: 'ORCA API Key',
      type: 'credential',
      status: 'valid',
      isMasked: true,
      configurable: true,
    },
    {
      id: 'api-key-n8n',
      name: 'n8n Webhook Key',
      type: 'credential',
      status: 'valid',
      isMasked: true,
      configurable: true,
    },
    {
      id: 'session-secret',
      name: 'Session Secret',
      type: 'credential',
      status: 'unknown',
      isMasked: true,
      configurable: false,
    },
  ])

  const [validating, setValidating] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const validateConfig = async (configId: string) => {
    setValidating(configId)
    try {
      // TODO: Call backend API to validate config
      // const response = await fetch(`/api/v1/orca/kernel/${configId}/validate`, {
      //   method: 'POST',
      // })
      // const result = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === configId ? { ...c, status: 'valid' } : c
        )
      )
    } catch (error) {
      console.error('Validation failed:', error)
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === configId ? { ...c, status: 'invalid' } : c
        )
      )
    } finally {
      setValidating(null)
    }
  }

  const saveConfig = async (configId: string) => {
    setValidating(configId)
    try {
      // TODO: Call backend API to update config
      // Never store the actual value - only validate via backend
      // const response = await fetch(`/api/v1/orca/kernel/${configId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ value: editValue }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === configId ? { ...c, status: 'valid' } : c
        )
      )
      setEditingId(null)
      setEditValue('')
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setValidating(null)
    }
  }

  const getStatusColor = (status: KernelConfig['status']) => {
    switch (status) {
      case 'valid':
        return '#4ade80' // green
      case 'invalid':
        return '#ef4444' // red
      case 'unknown':
        return '#fbbf24' // amber
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status: KernelConfig['status']) => {
    switch (status) {
      case 'valid':
        return 'Valid'
      case 'invalid':
        return 'Invalid'
      case 'unknown':
        return 'Not Set'
      default:
        return 'Unknown'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '30px',
        backgroundColor: 'rgba(20, 20, 20, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
          Kernel & Credentials
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          System kernel configuration and secret management
        </p>
      </div>

      {/* Kernel Status */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
              Kernel Connection
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Backend kernel service status
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor:
                kernelStatus === 'connected'
                  ? '#4ade80'
                  : kernelStatus === 'error'
                    ? '#ef4444'
                    : '#888',
              boxShadow:
                kernelStatus === 'connected'
                  ? '0 0 10px #4ade80'
                  : kernelStatus === 'error'
                    ? '0 0 10px #ef4444'
                    : '0 0 10px #888',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color:
                kernelStatus === 'connected'
                  ? '#4ade80'
                  : kernelStatus === 'error'
                    ? '#ef4444'
                    : '#888',
            }}
          >
            {kernelStatus === 'connected'
              ? 'Connected'
              : kernelStatus === 'error'
                ? 'Connection Error'
                : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(100, 200, 255, 0.08)',
          border: '1px solid rgba(100, 200, 255, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Secrets are encrypted on the backend. Never displayed in plaintext for security compliance.
        </span>
      </div>

      {/* Configuration Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {configs.map((config) => (
          <div
            key={config.id}
            style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
            }}
          >
            {/* Config Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {config.type === 'connection' ? (
                  <Database size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                ) : (
                  <Lock size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                )}
                <h4
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  {config.name}
                </h4>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {config.status === 'valid' && (
                  <CheckCircle size={14} style={{ color: '#4ade80' }} />
                )}
                {config.status === 'invalid' && (
                  <AlertCircle size={14} style={{ color: '#ef4444' }} />
                )}
                {config.status === 'unknown' && (
                  <AlertCircle size={14} style={{ color: '#fbbf24' }} />
                )}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: getStatusColor(config.status),
                  }}
                >
                  {getStatusLabel(config.status)}
                </span>
              </div>
            </div>

            {/* Config Value (Always Masked) */}
            {editingId === config.id ? (
              <div
                style={{
                  marginBottom: '12px',
                }}
              >
                <input
                  type="password"
                  placeholder="Enter new value (never stored in browser)"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => saveConfig(config.id)}
                    disabled={!editValue || validating === config.id}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      backgroundColor: editValue
                        ? 'rgba(74, 222, 128, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: editValue
                        ? '1px solid rgba(74, 222, 128, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: editValue ? '#4ade80' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: editValue && validating !== config.id ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {validating === config.id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditValue('')
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  userSelect: 'none',
                }}
              >
                {config.isMasked ? '••••••••••' : 'value-displayed'}
              </div>
            )}

            {/* Action Buttons */}
            {!editingId && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {config.configurable && (
                  <button
                    onClick={() => setEditingId(config.id)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Update
                  </button>
                )}
                <button
                  onClick={() => validateConfig(config.id)}
                  disabled={validating === config.id}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: validating === config.id ? 'not-allowed' : 'pointer',
                  }}
                >
                  {validating === config.id ? 'Validating...' : 'Validate'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px 16px',
          backgroundColor: 'rgba(255, 193, 7, 0.08)',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          borderRadius: '8px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        ⚠️ Changes to kernel settings require a service restart to take effect.
      </div>
    </div>
  )
}

export default KernelSettingsPanel
