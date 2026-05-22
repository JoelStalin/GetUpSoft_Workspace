import { useState, useEffect } from 'react'
import { X, Zap, Gift, Bug } from 'lucide-react'

export interface Update {
  id: string
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'bugfix'
  icon?: any
}

const UPDATES: Update[] = [
  {
    id: '1',
    version: '1.5.0',
    date: '2026-05-22',
    title: 'Rich Text Editor',
    description: 'Add rich text editing capabilities to node descriptions and chat messages',
    type: 'feature',
    icon: Zap,
  },
  {
    id: '2',
    version: '1.5.0',
    date: '2026-05-22',
    title: 'Chat @Mentions',
    description: 'Mention team members directly in chat with @ symbol and autocomplete',
    type: 'feature',
    icon: Gift,
  },
  {
    id: '3',
    version: '1.5.0',
    date: '2026-05-22',
    title: 'Fixed window positioning',
    description: 'Floating windows now maintain their positions correctly on page reload',
    type: 'bugfix',
    icon: Bug,
  },
  {
    id: '4',
    version: '1.4.9',
    date: '2026-05-20',
    title: 'Context Menu on Nodes',
    description: 'Right-click on nodes to access quick actions: duplicate, delete, lock',
    type: 'feature',
    icon: Zap,
  },
  {
    id: '5',
    version: '1.4.9',
    date: '2026-05-20',
    title: 'Toast Notifications',
    description: 'Replace all alert() calls with beautiful toast notifications throughout the app',
    type: 'improvement',
    icon: Gift,
  },
]

interface WhatsNewPanelProps {
  onClose?: () => void
}

export default function WhatsNewPanel({ onClose }: WhatsNewPanelProps) {
  const [dismissedUpdates, setDismissedUpdates] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('orca_dismissed_updates')
    if (saved) {
      setDismissedUpdates(JSON.parse(saved))
    }
  }, [])

  const handleDismiss = (updateId: string) => {
    const updated = [...dismissedUpdates, updateId]
    setDismissedUpdates(updated)
    localStorage.setItem('orca_dismissed_updates', JSON.stringify(updated))
  }

  const unreadUpdates = UPDATES.filter((u) => !dismissedUpdates.includes(u.id))

  const getIcon = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return Zap
      case 'improvement':
        return Gift
      case 'bugfix':
        return Bug
      default:
        return Zap
    }
  }

  const getColor = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return '#4A9EFF'
      case 'improvement':
        return '#FF9F43'
      case 'bugfix':
        return '#1DB954'
      default:
        return '#999'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: `1px solid var(--stitch-border)`,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--stitch-text)',
            }}
          >
            What's New
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: 'var(--stitch-muted)',
            }}
          >
            {unreadUpdates.length} new update{unreadUpdates.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--stitch-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--stitch-text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--stitch-muted)'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Updates List */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {UPDATES.map((update) => {
          const isDismissed = dismissedUpdates.includes(update.id)
          const Icon = getIcon(update.type)
          const color = getColor(update.type)

          return (
            <div
              key={update.id}
              style={{
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: isDismissed ? 'transparent' : 'var(--stitch-elevated)',
                border: `1px solid ${isDismissed ? 'transparent' : 'var(--stitch-border)'}`,
                opacity: isDismissed ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Icon
                  size={14}
                  style={{
                    color,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--stitch-text)',
                      }}
                    >
                      {update.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: `${color}20`,
                        color,
                        borderRadius: '3px',
                        fontWeight: 500,
                      }}
                    >
                      v{update.version}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '11px',
                      color: 'var(--stitch-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {update.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--stitch-muted)',
                      }}
                    >
                      {new Date(update.date).toLocaleDateString('es-ES')}
                    </span>

                    {!isDismissed && (
                      <button
                        onClick={() => handleDismiss(update.id)}
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${color}`,
                          color,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${color}20`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {unreadUpdates.length === 0 && (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--stitch-muted)',
            fontSize: '12px',
          }}
        >
          <p>All updates dismissed!</p>
          <p style={{ fontSize: '11px', marginTop: '8px' }}>Check back soon for new features.</p>
        </div>
      )}
    </div>
  )
}
