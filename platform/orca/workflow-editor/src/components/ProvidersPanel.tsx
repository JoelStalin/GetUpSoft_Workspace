import React, { useState, useEffect } from 'react'
import { Check, AlertCircle, Loader, Lock } from 'lucide-react'

/**
 * Providers Management Panel
 * Manages AI provider credentials and status without exposing raw secrets
 */

interface Provider {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'validating'
  hasCredential: boolean
  lastVerified?: string
  icon?: string
}

export function ProvidersPanel() {
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: 'nvidia',
      name: 'NVIDIA',
      status: 'connected',
      hasCredential: true,
      lastVerified: '1 hour ago',
      icon: '🟩',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      status: 'connected',
      hasCredential: true,
      lastVerified: '30 minutes ago',
      icon: '🟥',
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      status: 'disconnected',
      hasCredential: false,
      icon: '🟦',
    },
  ])

  const [validating, setValidating] = useState<string | null>(null)
  const [showKeyInput, setShowKeyInput] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState('')

  const validateProvider = async (providerId: string) => {
    setValidating(providerId)
    try {
      // TODO: Call backend API to validate provider
      // const response = await fetch(`/api/v1/orca/providers/${providerId}/validate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ provider: providerId }),
      // })
      // const result = await response.json()
      // Update status based on response
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock validation
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? {
                ...p,
                status: 'connected',
                hasCredential: true,
                lastVerified: 'just now',
              }
            : p
        )
      )
      setShowKeyInput(null)
      setKeyInput('')
    } catch (error) {
      console.error('Provider validation failed:', error)
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, status: 'error' } : p
        )
      )
    } finally {
      setValidating(null)
    }
  }

  const getStatusColor = (status: Provider['status']) => {
    switch (status) {
      case 'connected':
        return '#4ade80' // green
      case 'disconnected':
        return '#888' // gray
      case 'error':
        return '#ef4444' // red
      case 'validating':
        return '#fbbf24' // amber
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status: Provider['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Not Configured'
      case 'error':
        return 'Connection Error'
      case 'validating':
        return 'Validating...'
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
          AI Providers
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Manage API keys and provider connections
        </p>
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
          API keys are securely stored on the backend and never displayed in plaintext.
        </span>
      </div>

      {/* Providers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {providers.map((provider) => (
          <div
            key={provider.id}
            style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Provider Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{provider.icon}</span>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  {provider.name}
                </h4>
              </div>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(provider.status),
                  boxShadow: `0 0 8px ${getStatusColor(provider.status)}`,
                }}
              />
            </div>

            {/* Status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status:</span>
              <span
                style={{
                  color: getStatusColor(provider.status),
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {provider.status === 'validating' && (
                  <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                )}
                {provider.status === 'connected' && <Check size={12} />}
                {provider.status === 'error' && <AlertCircle size={12} />}
                {getStatusLabel(provider.status)}
              </span>
            </div>

            {/* Last Verified */}
            {provider.lastVerified && (
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Verified {provider.lastVerified}
              </div>
            )}

            {/* Action Button */}
            {showKeyInput === provider.id ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <input
                  type="password"
                  placeholder="Paste API key (never stored in browser)"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => validateProvider(provider.id)}
                    disabled={!keyInput || validating === provider.id}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: keyInput
                        ? 'rgba(74, 222, 128, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: keyInput
                        ? '1px solid rgba(74, 222, 128, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: keyInput ? '#4ade80' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: keyInput && validating !== provider.id ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                  >
                    {validating === provider.id ? 'Validating...' : 'Validate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyInput(null)
                      setKeyInput('')
                    }}
                    style={{
                      padding: '8px 12px',
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
              <button
                onClick={() => setShowKeyInput(provider.id)}
                style={{
                  padding: '8px 12px',
                  backgroundColor:
                    provider.status === 'connected'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 0, 56, 0.1)',
                  border:
                    provider.status === 'connected'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 0, 56, 0.2)',
                  borderRadius: '6px',
                  color:
                    provider.status === 'connected'
                      ? 'rgba(255, 255, 255, 0.7)'
                      : '#ff0038',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {provider.status === 'connected' ? 'Update Key' : 'Add Key'}
              </button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ProvidersPanel
