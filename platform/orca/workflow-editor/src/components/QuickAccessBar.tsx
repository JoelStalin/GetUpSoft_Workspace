import { useState } from 'react'
import { useWindows } from '../contexts/WindowContext'
import { Package, MessageCircle, Settings, Bell, Search, Maximize2, Clock, BarChart3 } from 'lucide-react'
import Popover from './ui/Popover'
import WhatsNewPanel from './ui/WhatsNewPanel'

interface QuickAccessBarProps {
  searchOpen?: boolean
  onSearchToggle?: () => void
  miniZoomEnabled?: boolean
  onMiniZoomToggle?: () => void
}

export default function QuickAccessBar({
  searchOpen = false,
  onSearchToggle,
  miniZoomEnabled = true,
  onMiniZoomToggle
}: QuickAccessBarProps) {
  const { windows, updateWindow } = useWindows()
  const [showWhatsNew, setShowWhatsNew] = useState(false)

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
      label: 'Agent Log',
      icon: MessageCircle,
      color: '#99F6E4',
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Settings,
      color: '#1DB954',
    },
    {
      id: 'versions',
      label: 'Versions',
      icon: Clock,
      color: '#FF9F43',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: '#BB8FCE',
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
              width: '44px',
              height: '44px',
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
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isVisible ? color : 'var(--stitch-border)'
              e.currentTarget.style.color = isVisible ? color : 'var(--stitch-muted)'
              e.currentTarget.style.backgroundColor = isVisible
                ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`
                : 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Icon size={16} />
          </button>
        )
      })}

      {/* Search Toggle Button */}
      <button
        onClick={onSearchToggle}
        title="Toggle Search (Ctrl+K)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          padding: '0',
          backgroundColor: searchOpen
            ? 'rgba(74, 158, 255, 0.15)'
            : 'transparent',
          border: `1.5px solid ${searchOpen ? '#4A9EFF' : 'var(--stitch-border)'}`,
          borderRadius: '8px',
          color: searchOpen ? '#4A9EFF' : 'var(--stitch-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#4A9EFF'
          e.currentTarget.style.color = '#4A9EFF'
          e.currentTarget.style.backgroundColor = 'rgba(74, 158, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = searchOpen ? '#4A9EFF' : 'var(--stitch-border)'
          e.currentTarget.style.color = searchOpen ? '#4A9EFF' : 'var(--stitch-muted)'
          e.currentTarget.style.backgroundColor = searchOpen
            ? 'rgba(74, 158, 255, 0.15)'
            : 'transparent'
        }}
      >
        <Search size={16} />
      </button>

      {/* Mini Zoom Toggle Button */}
      <button
        onClick={onMiniZoomToggle}
        title="Toggle Mini Zoom"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          padding: '0',
          backgroundColor: miniZoomEnabled
            ? 'rgba(1, 219, 84, 0.15)'
            : 'transparent',
          border: `1.5px solid ${miniZoomEnabled ? '#1DB954' : 'var(--stitch-border)'}`,
          borderRadius: '8px',
          color: miniZoomEnabled ? '#1DB954' : 'var(--stitch-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1DB954'
          e.currentTarget.style.color = '#1DB954'
          e.currentTarget.style.backgroundColor = 'rgba(1, 219, 84, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = miniZoomEnabled ? '#1DB954' : 'var(--stitch-border)'
          e.currentTarget.style.color = miniZoomEnabled ? '#1DB954' : 'var(--stitch-muted)'
          e.currentTarget.style.backgroundColor = miniZoomEnabled
            ? 'rgba(1, 219, 84, 0.15)'
            : 'transparent'
        }}
      >
        <Maximize2 size={16} />
      </button>

      {/* What's New Button */}
      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'var(--stitch-border)',
          margin: '0 4px',
        }}
      />

      <Popover
        trigger={
          <button
            title="What's New"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: '0',
              backgroundColor: 'transparent',
              border: `1.5px solid var(--stitch-border)`,
              borderRadius: '8px',
              color: 'var(--stitch-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgb(255, 159, 67)'
              e.currentTarget.style.color = 'rgb(255, 159, 67)'
              e.currentTarget.style.backgroundColor = 'rgba(255, 159, 67, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
              e.currentTarget.style.color = 'var(--stitch-muted)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Bell size={16} />
          </button>
        }
        side="top"
        align="center"
        onOpenChange={setShowWhatsNew}
      >
        <div style={{ width: '320px', maxHeight: '450px' }}>
          <WhatsNewPanel onClose={() => setShowWhatsNew(false)} />
        </div>
      </Popover>
    </div>
  )
}
