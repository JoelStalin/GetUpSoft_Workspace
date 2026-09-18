import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface MenuItem {
  icon?: any
  label: string
  onClick?: () => void
  shortcut?: string
  submenu?: MenuItem[]
  color?: string
  separator?: boolean
  disabled?: boolean
}

interface MenuProps {
  trigger: React.ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
}

export default function Menu({ trigger, items, align = 'left' }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
        setSubmenuOpen(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const renderMenuItems = (menuItems: MenuItem[]) => {
    return menuItems.map((item, idx) => {
      if (item.separator) {
        return (
          <div
            key={`separator-${idx}`}
            style={{
              height: '1px',
              backgroundColor: 'var(--stitch-border)',
              margin: '4px 0',
            }}
          />
        )
      }

      const Icon = item.icon
      const hasSubmenu = item.submenu && item.submenu.length > 0

      return (
        <div key={idx} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              if (item.onClick && !hasSubmenu) {
                item.onClick()
                setIsOpen(false)
              } else if (hasSubmenu) {
                setSubmenuOpen(submenuOpen === `menu-${idx}` ? null : `menu-${idx}`)
              }
            }}
            onMouseEnter={(e) => {
              if (hasSubmenu) {
                setSubmenuOpen(`menu-${idx}`)
              }
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              }
            }}
            disabled={item.disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: item.disabled ? 'var(--stitch-muted)' : item.color || 'var(--stitch-text)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              opacity: item.disabled ? 0.5 : 1,
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {Icon && <Icon size={14} style={{ flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--stitch-muted)',
                  marginLeft: '8px',
                }}
              >
                {item.shortcut}
              </span>
            )}
            {hasSubmenu && <ChevronRight size={12} style={{ marginLeft: '4px' }} />}
          </button>

          {hasSubmenu && submenuOpen === `menu-${idx}` && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '100%',
                marginLeft: '4px',
                backgroundColor: 'rgb(var(--color-base-200))',
                border: '1px solid var(--stitch-border)',
                borderRadius: '8px',
                minWidth: '180px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                zIndex: 10001,
              }}
            >
              <div style={{ padding: '4px 0' }}>
                {renderMenuItems(item.submenu!)}
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            [align]: '0',
            marginTop: '4px',
            backgroundColor: 'rgb(var(--color-base-200))',
            border: '1px solid var(--stitch-border)',
            borderRadius: '8px',
            minWidth: '180px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
            padding: '4px 0',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {renderMenuItems(items)}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
