import { User } from '../../hooks/useMentions'
import { Check } from 'lucide-react'

interface MentionsPanelProps {
  users: User[]
  query: string
  selectedIndex: number
  onSelect: (user: User) => void
}

export default function MentionsPanel({
  users,
  query,
  selectedIndex,
  onSelect,
}: MentionsPanelProps) {
  if (users.length === 0) {
    return (
      <div
        style={{
          padding: '8px 12px',
          fontSize: '11px',
          color: 'var(--stitch-muted)',
          textAlign: 'center',
        }}
      >
        No users found
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      {users.map((user, idx) => {
        const isSelected = idx === selectedIndex

        return (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: isSelected ? 'var(--stitch-hover)' : 'transparent',
              border: 'none',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: `${user.color || 'var(--stitch-accent)'}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {user.avatar || user.name[0]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: 'var(--stitch-text)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--stitch-muted)' }}>
                @{user.name.toLowerCase().replace(/\s+/g, '_')}
              </div>
            </div>
            {isSelected && (
              <Check size={14} style={{ color: 'var(--stitch-accent)', flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
