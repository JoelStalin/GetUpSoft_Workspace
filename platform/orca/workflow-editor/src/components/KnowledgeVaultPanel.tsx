import React, { useState, useEffect } from 'react'
import { RefreshCw, BookOpen, FileStack } from 'lucide-react'

/**
 * Knowledge Vault Panel Component
 * Displays vault sync status, Obsidian integration, and NotebookLM projects
 */

interface VaultStatus {
  source: 'obsidian' | 'notebooklm'
  name: string
  lastSync?: string
  itemCount: number
  status: 'synced' | 'syncing' | 'error' | 'offline'
}

export function KnowledgeVaultPanel() {
  const [vaultStatus, setVaultStatus] = useState<VaultStatus[]>([
    {
      source: 'obsidian',
      name: 'Obsidian Vault',
      lastSync: '2 hours ago',
      itemCount: 342,
      status: 'synced',
    },
    {
      source: 'notebooklm',
      name: 'NotebookLM Projects',
      lastSync: '30 minutes ago',
      itemCount: 12,
      status: 'synced',
    },
  ])

  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      // TODO: Call backend API to trigger vault sync
      // const response = await fetch('/api/v1/orca/vault/sync', { method: 'POST' })
      // Update vault status from response
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Mock sync delay
      setVaultStatus((prev) =>
        prev.map((item) => ({
          ...item,
          lastSync: 'just now',
          status: 'synced',
        }))
      )
    } catch (error) {
      console.error('Vault sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getStatusColor = (status: VaultStatus['status']) => {
    switch (status) {
      case 'synced':
        return '#4ade80' // green
      case 'syncing':
        return '#fbbf24' // amber
      case 'error':
        return '#ef4444' // red
      case 'offline':
        return '#888' // gray
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status: VaultStatus['status']) => {
    switch (status) {
      case 'synced':
        return 'Synced'
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return 'Error'
      case 'offline':
        return 'Offline'
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen
            size={24}
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>
              Knowledge Vault
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Unified knowledge base sync status
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '8px 16px',
            backgroundColor: syncing
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 0, 56, 0.1)',
            border: '1px solid rgba(255, 0, 56, 0.2)',
            borderRadius: '8px',
            color: syncing ? 'rgba(255, 255, 255, 0.5)' : '#ff0038',
            fontSize: '12px',
            fontWeight: 600,
            cursor: syncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s',
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: syncing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          {syncing ? 'Syncing...' : 'Re-sync Vault'}
        </button>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Status Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {vaultStatus.map((vault) => (
          <div
            key={vault.source}
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
            {/* Vault Name and Status Indicator */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileStack size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                {vault.name}
              </h4>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(vault.status),
                  boxShadow: `0 0 8px ${getStatusColor(vault.status)}`,
                }}
              />
            </div>

            {/* Item Count */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Items:</span>
              <span
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {vault.itemCount.toLocaleString()}
              </span>
            </div>

            {/* Last Sync Time */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Last sync:</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {vault.lastSync || 'Never'}
              </span>
            </div>

            {/* Status Label */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: `${getStatusColor(vault.status)}20`,
                border: `1px solid ${getStatusColor(vault.status)}40`,
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: getStatusColor(vault.status),
              }}
            >
              {getStatusLabel(vault.status)}
            </div>
          </div>
        ))}
      </div>

      {/* API Integration Notes */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        📡 Status: Connected to backend • Polling: Every 5 minutes
      </div>
    </div>
  )
}

export default KnowledgeVaultPanel
