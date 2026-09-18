import React, { useState, useEffect } from 'react'
import {
  Server,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Plus,
  Lock,
  Zap
} from 'lucide-react'

/**
 * ORCA Agent Configuration Panel
 * Manage Orca Agent API keys, connection status, and gateway configuration
 * API keys are always masked except when newly generated
 */

interface ApiKey {
  id: string
  key: string
  name: string
  created: string
  lastUsed?: string
  status: 'active' | 'revoked' | 'expired'
  isMasked: boolean
  isNew?: boolean
}

interface AgentStatus {
  connected: boolean
  version: string
  endpoint: string
  cloudflareStatus: 'active' | 'inactive' | 'error'
  lastHealthCheck?: string
}

export function OrcaAgentPanel() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    connected: false,
    version: 'v1.0.0',
    endpoint: 'https://orca-agent.getupsoft.com',
    cloudflareStatus: 'active',
    lastHealthCheck: new Date().toISOString(),
  })

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-001',
      key: 'orca-agent-key-123456789',
      name: 'Production Key',
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      status: 'active',
      isMasked: true,
      isNew: false,
    },
  ])

  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Generate new API key
  const generateNewApiKey = async () => {
    setGenerating(true)
    try {
      // Call Orca Agent bootstrap endpoint
      const response = await fetch('http://localhost:8000/api/bootstrap/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const newKey: ApiKey = {
          id: `key-${Date.now()}`,
          key: data.api_key,
          name: `New Key (${new Date().toLocaleDateString()})`,
          created: new Date().toISOString(),
          status: 'active',
          isMasked: false,
          isNew: true,
        }
        setApiKeys([newKey, ...apiKeys])
        setShowApiKey(newKey.id)

        // Auto-mask after 30 seconds
        setTimeout(() => {
          setApiKeys(prev =>
            prev.map(k =>
              k.id === newKey.id ? { ...k, isMasked: true, isNew: false } : k
            )
          )
        }, 30000)
      }
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setGenerating(false)
    }
  }

  // Check agent health
  const checkAgentHealth = async () => {
    setChecking(true)
    try {
      const response = await fetch('http://localhost:8000/api/health')
      if (response.ok) {
        setAgentStatus(prev => ({
          ...prev,
          connected: true,
          lastHealthCheck: new Date().toISOString(),
        }))
      } else {
        setAgentStatus(prev => ({ ...prev, connected: false }))
      }
    } catch (error) {
      setAgentStatus(prev => ({ ...prev, connected: false }))
    } finally {
      setChecking(false)
    }
  }

  // Copy API key to clipboard
  const copyToClipboard = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Revoke API key
  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev =>
      prev.map(k =>
        k.id === keyId ? { ...k, status: 'revoked' } : k
      )
    )
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length)
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ORCA Agent</h2>
              <p className="text-xs text-slate-400">API Key Management & Gateway Control</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            agentStatus.connected ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              agentStatus.connected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`} />
            <span className="text-xs font-medium">
              {agentStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Agent Status Card */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Agent Status
            </h3>
            <button
              onClick={checkAgentHealth}
              disabled={checking}
              className="p-1.5 hover:bg-slate-600/50 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-slate-200">{agentStatus.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoint</span>
              <span className="text-slate-200 font-mono text-xs">{agentStatus.endpoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cloudflare</span>
              <span className={`text-xs font-medium ${
                agentStatus.cloudflareStatus === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {agentStatus.cloudflareStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              API Keys
            </h3>
            <button
              onClick={generateNewApiKey}
              disabled={generating}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Generate Key
            </button>
          </div>

          {/* API Keys List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{apiKey.name}</h4>
                      {apiKey.isNew && (
                        <span className="px-2 py-0.5 bg-green-500/30 text-green-300 text-xs rounded-full">
                          NEW
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        apiKey.status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {apiKey.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Created: {new Date(apiKey.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Key Display */}
                <div className="bg-slate-800/50 rounded p-2 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-slate-300 truncate">
                    {showApiKey === apiKey.id && !apiKey.isMasked
                      ? apiKey.key
                      : maskApiKey(apiKey.key)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      {showApiKey === apiKey.id && !apiKey.isMasked ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copiedKey === apiKey.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                {apiKey.status === 'active' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => revokeApiKey(apiKey.id)}
                      className="flex-1 text-xs px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200 space-y-2">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Security Notice</p>
              <p className="text-blue-300/80 mt-1">
                API keys are masked after 30 seconds of generation. Save them in a secure location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
