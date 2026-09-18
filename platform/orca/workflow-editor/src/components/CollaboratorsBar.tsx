import { Users, Wifi, WifiOff } from 'lucide-react'
import { Collaborator } from '../hooks/useWorkflowCollaboration'

interface CollaboratorsBarProps {
  collaborators: Collaborator[]
  currentUserId: string
  isConnected: boolean
}

/**
 * Bar showing active collaborators in real-time
 */
export default function CollaboratorsBar({
  collaborators,
  currentUserId,
  isConnected,
}: CollaboratorsBarProps) {
  const activeCollaborators = collaborators.filter((c) => c.isActive)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        backgroundColor: 'rgba(var(--color-base-300), 0.5)',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'var(--stitch-muted)',
        minWidth: 'fit-content',
      }}
    >
      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isConnected ? (
          <>
            <Wifi size={14} color='rgb(22, 199, 132)' />
            <span style={{ color: 'rgb(22, 199, 132)' }}>Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={14} color='rgb(237, 49, 93)' />
            <span style={{ color: 'rgb(237, 49, 93)' }}>Offline</span>
          </>
        )}
      </div>

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '16px',
          backgroundColor: 'var(--stitch-border)',
        }}
      />

      {/* Collaborators count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Users size={14} color='var(--stitch-muted)' />
        <span>{activeCollaborators.length + 1}</span>
      </div>

      {/* Collaborator avatars */}
      {activeCollaborators.length > 0 && (
        <>
          <div
            style={{
              width: '1px',
              height: '16px',
              backgroundColor: 'var(--stitch-border)',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '-4px',
              marginLeft: '4px',
            }}
          >
            {activeCollaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: collaborator.color,
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  border: '2px solid rgb(var(--color-base-100))',
                  marginLeft: '-4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title={collaborator.name}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)'
                  e.currentTarget.style.zIndex = '10'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.zIndex = 'auto'
                }}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
