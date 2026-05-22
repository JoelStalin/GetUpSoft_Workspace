import { Copy, Trash2, Lock, Unlock, Eye, EyeOff, Zap, Link2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface ContextMenuProps {
  nodeId: string
  nodeName?: string
  nodeType?: string
  onDuplicate: () => void
  onDelete: () => void
  onLock?: () => void
  onUnlock?: () => void
  onHide?: () => void
  onShow?: () => void
  onEditWithAI?: () => void
  isLocked?: boolean
  isHidden?: boolean
  children: React.ReactNode
}

export default function ContextMenu({
  nodeId,
  nodeName,
  nodeType,
  onDuplicate,
  onDelete,
  onLock,
  onUnlock,
  onHide,
  onShow,
  onEditWithAI,
  isLocked = false,
  isHidden = false,
  children,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsOpen(true)
  }, [])

  const handleAction = useCallback(
    (action: () => void) => {
      action()
      setIsOpen(false)
    },
    []
  )

  return (
    <div
      onContextMenu={handleContextMenu}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {children}

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              backgroundColor: 'rgb(var(--color-base-100))',
              border: '1px solid var(--stitch-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              minWidth: '200px',
              overflow: 'hidden',
            }}
          >
            {nodeName && (
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--stitch-border)',
                  fontSize: '12px',
                  color: 'var(--stitch-muted)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {nodeName}
              </div>
            )}

            <div>
              <MenuItem
                icon={<Copy size={14} />}
                label="Duplicate"
                onClick={() => handleAction(onDuplicate)}
              />

              {isLocked ? (
                <MenuItem
                  icon={<Unlock size={14} />}
                  label="Unlock"
                  onClick={() => handleAction(onUnlock || (() => {}))}
                  disabled={!onUnlock}
                />
              ) : (
                <MenuItem
                  icon={<Lock size={14} />}
                  label="Lock"
                  onClick={() => handleAction(onLock || (() => {}))}
                  disabled={!onLock}
                />
              )}

              {isHidden ? (
                <MenuItem
                  icon={<Eye size={14} />}
                  label="Show"
                  onClick={() => handleAction(onShow || (() => {}))}
                  disabled={!onShow}
                />
              ) : (
                <MenuItem
                  icon={<EyeOff size={14} />}
                  label="Hide"
                  onClick={() => handleAction(onHide || (() => {}))}
                  disabled={!onHide}
                />
              )}

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--stitch-border)',
                  margin: '4px 0',
                }}
              />

              <MenuItem
                icon={<Zap size={14} color="#4A9EFF" />}
                label="Edit with AI"
                onClick={() => handleAction(onEditWithAI || (() => {}))}
                disabled={!onEditWithAI}
              />

              <MenuItem
                icon={<Link2 size={14} color="#1DB954" />}
                label="Connect to..."
                onClick={() => handleAction(() => {})}
              />

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--stitch-border)',
                  margin: '4px 0',
                }}
              />

              <MenuItem
                icon={<Trash2 size={14} color="#ed315d" />}
                label="Delete"
                onClick={() => handleAction(onDelete)}
                variant="danger"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        color: variant === 'danger' ? '#ed315d' : disabled ? 'var(--stitch-muted)' : 'var(--stitch-text)',
        fontSize: '12px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor =
            variant === 'danger' ? 'rgba(237, 49, 93, 0.1)' : 'rgba(74, 158, 255, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span>{label}</span>
    </button>
  )
}
