import { useRef, useState, useEffect } from 'react'
import { ChevronDown, X, Lock } from 'lucide-react'
import { useWindows, FloatingWindow as Window } from '../contexts/WindowContext'

interface FloatingWindowProps {
  window: Window
  children: React.ReactNode
}

export default function FloatingWindow({ window, children }: FloatingWindowProps) {
  const { updateWindow, bringToFront, toggleMinimize, toggleLock, removeWindow } = useWindows()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (window.isLocked) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    })
    bringToFront(window.id)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
    })
    bringToFront(window.id)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateWindow(window.id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        updateWindow(window.id, {
          width: Math.max(200, resizeStart.width + deltaX),
          height: Math.max(100, resizeStart.height + deltaY),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, window.id, updateWindow])

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: `${window.x}px`,
        top: `${window.y}px`,
        width: `${window.width}px`,
        height: window.isMinimized ? 'auto' : `${window.height}px`,
        zIndex: window.zIndex,
        backgroundColor: 'rgb(var(--color-base-200))',
        borderRadius: '12px',
        boxShadow: window.isLocked
          ? '0 0 30px rgba(74, 158, 255, 0.25), 0 10px 40px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease, border-color 0.3s ease',
        border: `1.5px solid ${
          window.isLocked
            ? 'rgba(74, 158, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.05)'
        }`,
      }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        onMouseDown={handleHeaderMouseDown}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(54, 53, 89, 0.8) 0%, rgba(36, 36, 60, 0.8) 100%)',
          borderBottom: `1px solid var(--stitch-border)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: window.isLocked ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
          flexShrink: 0,
          userSelect: 'none',
          opacity: window.isLocked ? 0.6 : 1,
          transition: 'opacity 0.2s ease, background 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!window.isLocked) {
            e.currentTarget.style.background =
              'linear-gradient(135deg, rgba(64, 63, 99, 0.9) 0%, rgba(46, 46, 70, 0.9) 100%)'
          }
        }}
        onMouseLeave={(e) => {
          if (!window.isLocked) {
            e.currentTarget.style.background =
              'linear-gradient(135deg, rgba(54, 53, 89, 0.8) 0%, rgba(36, 36, 60, 0.8) 100%)'
          }
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--stitch-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {window.title}
        </h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => toggleLock(window.id)}
            title={window.isLocked ? 'Unlock window' : 'Lock window'}
            style={{
              background: 'none',
              border: 'none',
              color: window.isLocked ? 'var(--stitch-accent)' : 'var(--stitch-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!window.isLocked) {
                e.currentTarget.style.color = 'var(--stitch-text)'
              }
            }}
            onMouseLeave={(e) => {
              if (!window.isLocked) {
                e.currentTarget.style.color = 'var(--stitch-muted)'
              }
            }}
          >
            <Lock
              size={14}
              style={{
                opacity: window.isLocked ? 1 : 0.5,
              }}
            />
          </button>
          <button
            onClick={() => toggleMinimize(window.id)}
            title={window.isMinimized ? 'Expand' : 'Minimize'}
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
            <ChevronDown
              size={14}
              style={{
                transform: window.isMinimized ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          <button
            onClick={() => updateWindow(window.id, { isVisible: false })}
            title="Hide window"
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
        </div>
      </div>

      {/* Content */}
      {!window.isMinimized && (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      )}

      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '18px',
          height: '18px',
          cursor: window.isLocked ? 'not-allowed' : 'se-resize',
          background: isResizing
            ? 'rgba(74, 158, 255, 0.5)'
            : 'rgba(74, 158, 255, 0.1)',
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          borderBottomRightRadius: '12px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '2px',
          opacity: window.isLocked ? 0 : 1,
        }}
        onMouseEnter={(e) => {
          if (!window.isLocked) {
            e.currentTarget.style.background = 'rgba(74, 158, 255, 0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (!window.isLocked) {
            e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)'
          }
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--stitch-accent)',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  )
}
