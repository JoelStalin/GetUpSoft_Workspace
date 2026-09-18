import { useState, useEffect, useRef } from 'react'

interface MiniZoomProps {
  canvasRef?: React.RefObject<HTMLDivElement>
  enabled?: boolean
  zoom?: number
  size?: number
}

export default function MiniZoom({ canvasRef, enabled = true, zoom = 2, size = 160 }: MiniZoomProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const miniZoomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      // Get cursor position
      const cursorX = e.clientX
      const cursorY = e.clientY

      // Update canvas offset if ref exists
      if (canvasRef?.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasOffset({ x: rect.left, y: rect.top })
      }

      // Position mini zoom slightly offset from cursor (upper-right)
      setPosition({
        x: cursorX + 15,
        y: cursorY + 15,
      })

      // Check if cursor is over canvas
      if (canvasRef?.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const isOverCanvas =
          e.clientX >= canvasRect.left &&
          e.clientX <= canvasRect.right &&
          e.clientY >= canvasRect.top &&
          e.clientY <= canvasRect.bottom

        setIsVisible(isOverCanvas)
      } else {
        setIsVisible(true)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enabled, canvasRef])

  if (!enabled || !isVisible) return null

  // Calculate the viewport showing under the cursor
  const scale = 1 / zoom
  const offsetX = (position.x - canvasOffset.x) * scale - size / 2 / zoom
  const offsetY = (position.y - canvasOffset.y) * scale - size / 2 / zoom

  return (
    <div
      ref={miniZoomRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 200,
        backgroundColor: 'rgb(var(--color-base-300))',
        border: '2px solid var(--stitch-accent)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {/* Content scaled view */}
      <div
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
          left: `${-canvasOffset.x * zoom - offsetX * zoom}px`,
          top: `${-canvasOffset.y * zoom - offsetY * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          backgroundColor: 'rgb(var(--color-base-100))',
          pointerEvents: 'none',
        }}
      >
        {/* Canvas content would be rendered here via canvas ref */}
        <div style={{ fontSize: '10px', color: 'var(--stitch-muted)', padding: '4px' }}>
          Zoom: {zoom}x
        </div>
      </div>

      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '100%',
          backgroundColor: 'rgba(74, 158, 255, 0.3)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(74, 158, 255, 0.3)',
        }}
      />
    </div>
  )
}
