import { useState } from 'react'
import {
  Monitor, Tablet, Smartphone, Globe, RefreshCw, ExternalLink,
  ZoomIn, ZoomOut, RotateCcw, Layers, Grid3x3, Eye, Code2,
  Plus, X, AlertTriangle, ChevronRight,
} from 'lucide-react'

/* ── Design tokens (matches ORCA design system exactly) ─────────────── */
const ACCENT = '#4A9EFF'
const ACCENT_BG = 'rgba(74,158,255,0.12)'

/* ── Device presets ──────────────────────────────────────────────────── */
const DEVICES = [
  { id: 'responsive', label: 'Responsive', Icon: Monitor,    w: null, h: null },
  { id: 'desktop',    label: 'Desktop',    Icon: Monitor,    w: 1440, h: 900 },
  { id: 'laptop',     label: 'Laptop',     Icon: Monitor,    w: 1280, h: 800 },
  { id: 'tablet',     label: 'Tablet',     Icon: Tablet,     w: 768,  h: 1024 },
  { id: 'mobile',     label: 'Mobile',     Icon: Smartphone, w: 390,  h: 844 },
]

const ZOOMS = [25, 50, 75, 100, 125, 150, 200]

/* ── Shared icon-button ──────────────────────────────────────────────── */
function IconBtn({
  icon: Icon,
  active = false,
  title,
  color = ACCENT,
  size = 14,
  onClick,
}: {
  icon: React.ElementType
  active?: boolean
  title: string
  color?: string
  size?: number
  onClick?: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        border: `1px solid ${active ? color : 'var(--stitch-border)'}`,
        backgroundColor: active ? `${color}18` : 'transparent',
        color: active ? color : 'var(--stitch-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.color = color
        e.currentTarget.style.backgroundColor = `${color}18`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = active ? color : 'var(--stitch-border)'
        e.currentTarget.style.color = active ? color : 'var(--stitch-muted)'
        e.currentTarget.style.backgroundColor = active ? `${color}18` : 'transparent'
      }}
    >
      <Icon size={size} />
    </button>
  )
}

/* ── Separator ───────────────────────────────────────────────────────── */
const Sep = () => (
  <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--stitch-border)', flexShrink: 0 }} />
)

/* ── Section label ───────────────────────────────────────────────────── */
const SectionLabel = ({ label, action }: { label: string; action?: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', marginTop: '4px' }}>
    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
      {label}
    </span>
    {action}
  </div>
)

/* ── Main component ──────────────────────────────────────────────────── */
export default function WebDesignMode() {
  const [url,       setUrl]       = useState('')
  const [inputUrl,  setInputUrl]  = useState('')
  const [deviceId,  setDeviceId]  = useState('responsive')
  const [zoom,      setZoom]      = useState(100)
  const [landscape, setLandscape] = useState(false)
  const [frameKey,  setFrameKey]  = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [leftOpen,  setLeftOpen]  = useState(true)
  const [rightOpen, setRightOpen] = useState(false)
  const [showGrid,  setShowGrid]  = useState(false)

  const device = DEVICES.find((d) => d.id === deviceId)!
  const isResponsive = deviceId === 'responsive'
  const dW = !isResponsive && landscape && device.h && device.w ? device.h : device.w
  const dH = !isResponsive && landscape && device.h && device.w ? device.w : device.h

  /* ── Helpers ── */
  const navigate = (raw = inputUrl) => {
    if (!raw.trim()) return
    const href = raw.startsWith('http') ? raw : `https://${raw}`
    setUrl(href)
    setInputUrl(href)
    setLoading(true)
    setFrameKey((k) => k + 1)
    setTimeout(() => setLoading(false), 1000)
  }

  const cycleZoom = (dir: 1 | -1) => {
    const i = ZOOMS.indexOf(zoom)
    const next = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i + dir))]
    setZoom(next ?? zoom)
  }

  /* ═══════════════════════════════════════════════════════ RENDER ════ */
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgb(var(--color-base-100))',
      }}
    >
      {/* ══════════════════════════════════════ TOOLBAR ══ */}
      <div
        style={{
          height: '48px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          borderBottom: '1px solid var(--stitch-border)',
          backgroundColor: 'var(--stitch-elevated)',
        }}
      >
        {/* Layers toggle */}
        <IconBtn icon={Layers} active={leftOpen} title="Layers panel" onClick={() => setLeftOpen((v) => !v)} />
        <Sep />

        {/* Device picker — icon only, text tooltip */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {DEVICES.map(({ id, label, Icon }) => {
            const active = id === deviceId
            return (
              <button
                key={id}
                title={label}
                onClick={() => setDeviceId(id)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: active ? ACCENT_BG : 'transparent',
                  color: active ? ACCENT : 'var(--stitch-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'; e.currentTarget.style.color = 'var(--stitch-text)' } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--stitch-muted)' } }}
              >
                <Icon size={15} />
              </button>
            )
          })}
        </div>

        {/* Dimension badge + rotate */}
        {!isResponsive && (
          <>
            <Sep />
            <span style={{ fontSize: '11px', color: 'var(--stitch-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--stitch-text)', fontWeight: 600 }}>{dW}</span>
              {'×'}
              <span style={{ color: 'var(--stitch-text)', fontWeight: 600 }}>{dH}</span>
            </span>
            <button
              title="Rotate"
              onClick={() => setLandscape((v) => !v)}
              style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', color: 'var(--stitch-muted)', cursor: 'pointer', display: 'flex', transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--stitch-muted)' }}
            >
              <RotateCcw size={13} />
            </button>
          </>
        )}

        {/* URL bar — centered, flex 1 */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              maxWidth: '480px',
              padding: '0 10px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--stitch-border)',
              backgroundColor: 'rgb(var(--color-base-100))',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = ACCENT }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-border)' }}
          >
            <Globe size={12} style={{ color: 'var(--stitch-muted)', flexShrink: 0 }} />
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate()}
              placeholder="Enter URL to preview…"
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                color: 'var(--stitch-text)',
                fontSize: '12px',
                padding: 0,
              }}
            />
            {inputUrl && (
              <button
                onClick={() => { setUrl(''); setInputUrl('') }}
                style={{ background: 'none', border: 'none', color: 'var(--stitch-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Reload + open external */}
        <button
          onClick={() => navigate()}
          title="Reload"
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--stitch-border)', backgroundColor: 'transparent', color: 'var(--stitch-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-border)'; e.currentTarget.style.color = 'var(--stitch-muted)' }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'wdSpin 0.8s linear infinite' : 'none' }} />
        </button>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Open in new tab"
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--stitch-border)', color: 'var(--stitch-muted)', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--stitch-border)'; e.currentTarget.style.color = 'var(--stitch-muted)' }}
          >
            <ExternalLink size={13} />
          </a>
        )}

        <Sep />

        {/* View controls */}
        <IconBtn icon={Grid3x3} active={showGrid} title="Toggle grid" onClick={() => setShowGrid((v) => !v)} />
        <IconBtn icon={Code2} active={rightOpen} title="Inspect panel" onClick={() => setRightOpen((v) => !v)} />
        <Sep />

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => cycleZoom(-1)} title="Zoom out" style={{ padding: '4px', border: 'none', background: 'none', color: 'var(--stitch-muted)', cursor: 'pointer', display: 'flex', borderRadius: '4px' }}>
            <ZoomOut size={13} />
          </button>
          <span style={{ fontSize: '11px', color: 'var(--stitch-text)', fontWeight: 600, minWidth: '36px', textAlign: 'center', fontFamily: 'monospace' }}>
            {zoom}%
          </span>
          <button onClick={() => cycleZoom(1)} title="Zoom in" style={{ padding: '4px', border: 'none', background: 'none', color: 'var(--stitch-muted)', cursor: 'pointer', display: 'flex', borderRadius: '4px' }}>
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════ BODY ═════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left panel ── */}
        {leftOpen && (
          <div
            style={{
              width: '200px',
              flexShrink: 0,
              borderRight: '1px solid var(--stitch-border)',
              backgroundColor: 'rgb(var(--color-base-200))',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <SectionLabel
              label="Pages"
              action={
                <button style={{ background: 'none', border: 'none', color: 'var(--stitch-muted)', cursor: 'pointer', padding: '2px', borderRadius: '4px', display: 'flex' }}>
                  <Plus size={12} />
                </button>
              }
            />
            {['Home', 'About', 'Contact', 'Blog'].map((page, i) => (
              <div
                key={page}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  color: i === 0 ? ACCENT : 'var(--stitch-text)',
                  borderLeft: `2px solid ${i === 0 ? ACCENT : 'transparent'}`,
                  backgroundColor: i === 0 ? ACCENT_BG : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.backgroundColor = 'var(--stitch-hover)' }}
                onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Eye size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                {page}
              </div>
            ))}

            <div style={{ height: '1px', backgroundColor: 'var(--stitch-border)', margin: '8px 0' }} />

            <SectionLabel label="Layers" />
            {url ? (
              ['<html>', '<head>', '<body>', '<header>', '<main>', '<footer>'].map((tag) => (
                <div
                  key={tag}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px 4px 18px', fontSize: '11px', color: 'var(--stitch-muted)', cursor: 'default', fontFamily: 'monospace' }}
                >
                  <ChevronRight size={9} />
                  {tag}
                </div>
              ))
            ) : (
              <p style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--stitch-muted)', opacity: 0.6, margin: 0 }}>
                No page loaded
              </p>
            )}
          </div>
        )}

        {/* ── Canvas ── */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            backgroundColor: url && !isResponsive ? '#111118' : 'rgb(var(--color-base-100))',
            backgroundImage: showGrid ? 'linear-gradient(rgba(74,158,255,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(74,158,255,0.05) 1px, transparent 1px)' : 'none',
            backgroundSize: showGrid ? '24px 24px' : 'auto',
          }}
        >
          {/* Loading bar */}
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', zIndex: 20, background: `linear-gradient(90deg, ${ACCENT}, rgba(74,158,255,0.3), ${ACCENT})`, backgroundSize: '200% 100%', animation: 'wdShimmer 1.2s ease-in-out infinite' }} />
          )}

          {!url ? (
            /* Empty state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '14px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  border: '1.5px dashed var(--stitch-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={30} style={{ color: 'var(--stitch-muted)', opacity: 0.4 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--stitch-text)', marginBottom: '6px' }}>
                  No page loaded
                </div>
                <div style={{ fontSize: '12px', color: 'var(--stitch-muted)', lineHeight: 1.6 }}>
                  Enter a URL in the address bar and press Enter
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(245,158,11,0.2)',
                  backgroundColor: 'rgba(245,158,11,0.05)',
                  maxWidth: '340px',
                  fontSize: '11px',
                  color: 'var(--stitch-muted)',
                  lineHeight: 1.6,
                }}
              >
                <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                Sites with X-Frame-Options or CSP headers cannot be embedded. Use <code style={{ color: ACCENT, fontSize: '10px' }}>localhost</code> for best results.
              </div>
            </div>
          ) : (
            /* Preview */
            <div
              style={{
                display: 'flex',
                alignItems: isResponsive ? 'stretch' : 'flex-start',
                justifyContent: 'center',
                padding: isResponsive ? 0 : '40px',
                minHeight: '100%',
              }}
            >
              {/* Dimension label */}
              {!isResponsive && (
                <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  {dW} × {dH}  ·  {zoom}%
                </div>
              )}
              <div
                style={{
                  position: 'relative',
                  width: isResponsive ? '100%' : `${(dW ?? 1440) * (zoom / 100)}px`,
                  height: isResponsive ? '100%' : `${(dH ?? 900) * (zoom / 100)}px`,
                  overflow: 'hidden',
                  borderRadius: isResponsive ? 0 : '4px',
                  border: isResponsive ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isResponsive ? 'none' : '0 8px 48px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}
              >
                <iframe
                  key={frameKey}
                  src={url}
                  title="Web Design Preview"
                  style={{
                    width: isResponsive ? '100%' : `${dW}px`,
                    height: isResponsive ? '100%' : `${dH}px`,
                    border: 'none',
                    display: 'block',
                    transform: isResponsive ? 'none' : `scale(${zoom / 100})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel (Inspect) ── */}
        {rightOpen && (
          <div
            style={{
              width: '220px',
              flexShrink: 0,
              borderLeft: '1px solid var(--stitch-border)',
              backgroundColor: 'rgb(var(--color-base-200))',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <SectionLabel label="Viewport" />
            <div style={{ padding: '0 12px 12px' }}>
              {[
                ['Device',  device.label],
                ['Width',   isResponsive ? 'Fluid' : `${dW}px`],
                ['Height',  isResponsive ? 'Fluid' : `${dH}px`],
                ['Zoom',    `${zoom}%`],
                ['Grid',    showGrid ? 'On' : 'Off'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--stitch-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--stitch-muted)' }}>{k}</span>
                  <span style={{ fontSize: '11px', color: 'var(--stitch-text)', fontFamily: 'monospace', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <SectionLabel label="Page" />
            <div style={{ padding: '0 12px 12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--stitch-text)', wordBreak: 'break-all', lineHeight: 1.6, fontFamily: 'monospace' }}>
                {url || '—'}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wdSpin    { to { transform: rotate(360deg); } }
        @keyframes wdShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  )
}
