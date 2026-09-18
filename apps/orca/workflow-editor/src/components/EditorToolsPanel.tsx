import { Pointer, PenTool, Eye, MoreVertical, Zap, Hand, Square, Compass, Star, Copy } from 'lucide-react'

export default function EditorToolsPanel() {
  const tools = [
    { icon: Pointer, tooltip: 'Select (V)', color: '#4A9EFF' },
    { icon: PenTool, tooltip: 'Edit (E)', color: '#FF6B6B' },
    { icon: Eye, tooltip: 'View (W)', color: '#51CF66' },
    { icon: MoreVertical, tooltip: 'More', color: '#A78BFA' },
    { icon: Zap, tooltip: 'Actions', color: '#FFA500' },
    { icon: Hand, tooltip: 'Interact', color: '#FF1493' },
    { icon: Square, tooltip: 'Frame', color: '#00CED1' },
    { icon: Compass, tooltip: 'Measure', color: '#FFD700' },
    { icon: Star, tooltip: 'Bookmark', color: '#FF69B4' },
    { icon: Copy, tooltip: 'Duplicate', color: '#90EE90' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: 'var(--stitch-elevated)',
        border: `1px solid var(--stitch-border)`,
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 40,
      }}
    >
      {tools.map((tool, index) => {
        const Icon = tool.icon
        return (
          <button
            key={index}
            title={tool.tooltip}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: `1px solid var(--stitch-border)`,
              color: tool.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${tool.color}15`
              e.currentTarget.style.borderColor = tool.color
              e.currentTarget.style.boxShadow = `0 0 12px ${tool.color}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}
