import { useWindows } from '../contexts/WindowContext'
import { Package, Bot, Settings } from 'lucide-react'

export default function QuickAccessBar() {
  const { windows, updateWindow } = useWindows()

  const toggleWindowVisibility = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId)
    if (window) {
      updateWindow(windowId, { isVisible: !window.isVisible })
    }
  }

  const windowButtons = [
    {
      id: 'components',
      label: 'Components',
      icon: Package,
      color: '#7c4dff',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: Bot,
      color: '#4A9EFF',
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Settings,
      color: '#1DB954',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: 'var(--stitch-elevated)',
        border: `1px solid var(--stitch-border)`,
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 50,
      }}
    >
      {windowButtons.map(({ id, label, icon: Icon, color }) => {
        const window = windows.find((w) => w.id === id)
        const isVisible = window?.isVisible ?? true

        return (
          <button
            key={id}
            onClick={() => toggleWindowVisibility(id)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              padding: '0',
              backgroundColor: isVisible
                ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`
                : 'transparent',
              border: `1.5px solid ${isVisible ? color : 'var(--stitch-border)'}`,
              borderRadius: '8px',
              color: isVisible ? color : 'var(--stitch-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color
              e.currentTarget.style.color = color
              e.currentTarget.style.backgroundColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isVisible ? color : 'var(--stitch-border)'
              e.currentTarget.style.color = isVisible ? color : 'var(--stitch-muted)'
              e.currentTarget.style.backgroundColor = isVisible
                ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`
                : 'transparent'
            }}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
}
