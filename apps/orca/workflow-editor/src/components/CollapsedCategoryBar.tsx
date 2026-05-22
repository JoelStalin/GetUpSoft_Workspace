import { useRef, useState, useEffect } from 'react'
import { Bell, Brain, Globe, GitBranch, Wrench } from 'lucide-react'

interface CollapsedCategoryBarProps {
  x: number
  y: number
  height: number
  onExpand: () => void
}

const categories = [
  { name: 'Triggers', icon: Bell, color: '#ff6d5a' },
  { name: 'AI', icon: Brain, color: '#7c4dff' },
  { name: 'Network', icon: Globe, color: '#1a9ba1' },
  { name: 'Control Flow', icon: GitBranch, color: '#ff9f43' },
  { name: 'Utils', icon: Wrench, color: '#576574' },
]

export default function CollapsedCategoryBar({ x, y, height, onExpand }: CollapsedCategoryBarProps) {
  const [position, setPosition] = useState({ x, y })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const barRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '56px',
        height: `${height}px`,
        backgroundColor: 'rgb(var(--color-base-200))',
        border: `1px solid var(--stitch-border)`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0',
        gap: '8px',
        overflow: 'hidden',
        zIndex: 5,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {categories.map(({ name, icon: Icon, color }) => (
        <button
          key={name}
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          title={`View ${name} components`}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--stitch-muted)',
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
            e.currentTarget.style.color = color
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--stitch-muted)'
          }}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  )
}
