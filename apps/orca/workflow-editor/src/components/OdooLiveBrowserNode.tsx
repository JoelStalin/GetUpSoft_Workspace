import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { Maximize2, Minimize2, X, Eye, EyeOff } from 'lucide-react'

interface OdooLiveBrowserNodeProps {
  data: {
    iframeSrc?: string
    currentStep?: string
    steps?: string[]
    isError?: boolean
    errorMessage?: string
    frameImage?: string
    onClose?: () => void
  }
  selected?: boolean
}

export function OdooLiveBrowserNode({ data, selected }: OdooLiveBrowserNodeProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [renderMode, setRenderMode] = useState<'iframe' | 'step-viewer'>('step-viewer')
  const [frameSize, setFrameSize] = useState({ w: 800, h: 500 })
  const [framePos, setFramePos] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(data?.errorMessage || null)
  const dragRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 })
  const resizeRef = useRef<{ active: boolean; sx: number; sy: number; w: number; h: number }>({
    active: false,
    sx: 0,
    sy: 0,
    w: 800,
    h: 500,
  })
  const { getNodes } = useReactFlow()

  const iframeSrc = data?.iframeSrc || ''
  const currentStep = data?.currentStep || 'Inicializando...'
  const steps = data?.steps || []
  const frameImage = data?.frameImage || ''

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        setFramePos({
          x: e.clientX - dragRef.current.dx,
          y: e.clientY - dragRef.current.dy,
        })
      }
      if (resizeRef.current.active) {
        const dw = e.clientX - resizeRef.current.sx
        const dh = e.clientY - resizeRef.current.sy
        const newW = Math.max(400, resizeRef.current.w + dw)
        const newH = Math.max(300, resizeRef.current.h + dh)
        setFrameSize({ w: newW, h: newH })
      }
    }

    const handleMouseUp = () => {
      dragRef.current.active = false
      resizeRef.current.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const headerHeight = 42
  const contentHeight = frameSize.h - headerHeight

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: selected ? '2px solid #7c4dff' : '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        backgroundColor: '#0b0f17',
        boxShadow: selected ? '0 0 20px rgba(124, 77, 255, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.3)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: `${headerHeight}px`,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'grab',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          userSelect: 'none',
        }}
        onMouseDown={(e) => {
          dragRef.current = {
            active: true,
            dx: e.clientX - framePos.x,
            dy: e.clientY - framePos.y,
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: error ? '#ef4444' : '#4ade80',
              animation: error ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <span>
            Live Browser · Odoo {error ? 'Error' : 'E2E'}
          </span>
        </div>

        <span
          style={{
            flex: 1,
            marginLeft: '12px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {error ? `Error: ${error}` : `${currentStep} · ${iframeSrc.substring(0, 40)}`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setRenderMode((m) => (m === 'iframe' ? 'step-viewer' : 'iframe'))}
            title={`Toggle to ${renderMode === 'iframe' ? 'step' : 'iframe'} view`}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(124, 77, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            {renderMode === 'iframe' ? (
              <>
                <Eye size={10} />
                Pasos
              </>
            ) : (
              <>
                <EyeOff size={10} />
                Iframe
              </>
            )}
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore' : 'Maximize'}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(124, 77, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          <button
            onClick={() => {
              data?.onClose?.()
            }}
            title="Close live browser"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      {renderMode === 'iframe' && iframeSrc ? (
        <iframe
          title="odoo-live-browser"
          src={iframeSrc}
          key={iframeSrc}
          style={{
            width: '100%',
            height: `${contentHeight}px`,
            border: 'none',
            background: '#fff',
            flex: 1,
          }}
          onLoad={() => {
            setError(null)
          }}
          onError={() => {
            setError('No se pudo cargar el Live Browser.')
          }}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      ) : (
        <div
          style={{
            height: `${contentHeight}px`,
            overflow: 'auto',
            background: '#0f172a',
            color: '#e5e7eb',
            padding: '12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {error ? (
            <div
              style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '12px',
              }}
            >
              Error: {error}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>
                Proceso en vivo: Los pasos se actualizan mientras ORCA ejecuta la tarea.
              </div>

              {frameImage && (
                <div
                  style={{
                    marginBottom: '8px',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#020617',
                    maxHeight: '200px',
                  }}
                >
                  <img
                    src={frameImage}
                    alt="Odoo live frame"
                    style={{
                      width: '100%',
                      display: 'block',
                      maxHeight: '200px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {steps.length > 0 ? (
                steps.map((step, idx) => (
                  <div
                    key={`${idx}-${step}`}
                    style={{
                      fontSize: '11px',
                      lineHeight: 1.5,
                      padding: '8px',
                      border: `1px solid ${idx === steps.length - 1 ? 'rgba(124, 77, 255, 0.3)' : '#1e293b'}`,
                      borderRadius: '6px',
                      background: idx === steps.length - 1 ? 'rgba(124, 77, 255, 0.08)' : '#111827',
                      color: idx === steps.length - 1 ? '#bfdbfe' : '#e5e7eb',
                    }}
                  >
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', marginRight: '8px' }}>
                      {String(idx + 1).padStart(2, '0')}:
                    </span>
                    {step}
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280', fontSize: '11px', padding: '12px', textAlign: 'center' }}>
                  Esperando pasos...
                </div>
              )}

              {iframeSrc && (
                <a
                  href={iframeSrc}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#93c5fd',
                    fontSize: '11px',
                    textDecoration: 'underline',
                    marginTop: '4px',
                  }}
                >
                  → Abrir paso actual en nueva pestaña
                </a>
              )}
            </>
          )}
        </div>
      )}

      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          background: 'linear-gradient(135deg, transparent 0 50%, rgba(124,77,255,.4) 50% 100%)',
          borderRadius: '0 0 10px 0',
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          resizeRef.current = {
            active: true,
            sx: e.clientX,
            sy: e.clientY,
            w: frameSize.w,
            h: frameSize.h,
          }
        }}
      />

      {/* React Flow handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#7c4dff' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#7c4dff' }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default OdooLiveBrowserNode
