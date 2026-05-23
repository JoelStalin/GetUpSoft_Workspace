import { useState } from 'react'
import { Smartphone, RefreshCw, Globe, AlertTriangle } from 'lucide-react'

const DEVICES = [
  { id: 'iphone14', label: 'iPhone 14 Pro', width: 393, height: 852, scale: 0.85 },
  { id: 'pixel7', label: 'Pixel 7', width: 412, height: 915, scale: 0.82 },
  { id: 'ipad', label: 'iPad Air', width: 820, height: 1180, scale: 0.65 },
]

export default function MobileDesignMode() {
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [deviceId, setDeviceId] = useState('iphone14')
  const [isLoading, setIsLoading] = useState(false)
  const [key, setKey] = useState(0)

  const device = DEVICES.find((d) => d.id === deviceId)!

  const loadUrl = () => {
    if (!inputUrl.trim()) return
    const normalized = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
    setUrl(normalized)
    setInputUrl(normalized)
    setIsLoading(true)
    setKey((k) => k + 1)
    setTimeout(() => setIsLoading(false), 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgb(var(--color-base-100))' }}>
      <div
        style={{
          height: '48px', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '0 16px', borderBottom: '1px solid var(--stitch-border)',
          backgroundColor: 'var(--stitch-elevated)',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeviceId(d.id)}
              style={{
                padding: '4px 10px', borderRadius: '6px',
                border: `1px solid ${deviceId === d.id ? 'var(--stitch-accent)' : 'var(--stitch-border)'}`,
                backgroundColor: deviceId === d.id ? 'rgba(124, 77, 255, 0.12)' : 'transparent',
                color: deviceId === d.id ? 'var(--stitch-accent)' : 'var(--stitch-muted)',
                cursor: 'pointer', fontSize: '11px', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <Globe size={14} style={{ color: 'var(--stitch-muted)', flexShrink: 0 }} />
        <input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadUrl()}
          placeholder="Enter URL to preview..."
          style={{
            flex: 1, padding: '4px 10px', borderRadius: '6px',
            border: '1px solid var(--stitch-border)',
            backgroundColor: 'rgb(var(--color-base-100))',
            color: 'var(--stitch-text)', fontSize: '12px', outline: 'none',
          }}
        />
        <button
          onClick={loadUrl}
          style={{
            padding: '5px', borderRadius: '6px', border: '1px solid var(--stitch-border)',
            backgroundColor: 'transparent', color: 'var(--stitch-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      <div
        style={{
          flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '32px', position: 'relative',
          background: 'radial-gradient(ellipse at center, rgba(124,77,255,0.04) 0%, transparent 70%)',
        }}
      >
        {!url ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--stitch-muted)' }}>
            <Smartphone size={40} style={{ opacity: 0.25 }} />
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--stitch-text)' }}>Mobile Preview</div>
            <div style={{ fontSize: '12px', textAlign: 'center', maxWidth: '300px', lineHeight: 1.6 }}>
              Enter a URL above and press Enter to preview in the selected device frame.
            </div>
            <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,180,0,0.25)', backgroundColor: 'rgba(255,180,0,0.06)', fontSize: '11px', color: 'var(--stitch-muted)', display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '340px', lineHeight: 1.6 }}>
              <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
              Some sites block iframe embedding. Use localhost or sites that allow embedding.
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                position: 'relative',
                width: `${device.width * device.scale}px`,
                height: `${device.height * device.scale}px`,
                borderRadius: device.id === 'ipad' ? '20px' : '40px',
                border: '10px solid #2a2a3e',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)',
                backgroundColor: '#0a0a0f',
                overflow: 'hidden',
              }}
            >
              {deviceId === 'iphone14' && (
                <div
                  style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)', width: '120px', height: '34px',
                    backgroundColor: '#2a2a3e', borderRadius: '0 0 20px 20px', zIndex: 10,
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: deviceId === 'iphone14' ? '44px' : '24px',
                  backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '0 20px',
                  fontSize: '10px', color: '#fff', zIndex: 5,
                }}
              >
                <span>9:41</span>
                <span style={{ display: 'flex', gap: '4px' }}>&#9650; &#9679; &#9632;</span>
              </div>
              <iframe
                key={key}
                src={url}
                title="Mobile Preview"
                style={{
                  width: `${device.width / device.scale}px`,
                  height: `${device.height / device.scale}px`,
                  border: 'none',
                  transform: `scale(${device.scale})`,
                  transformOrigin: 'top left',
                  display: 'block',
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute', bottom: '16px', left: '50%',
                transform: 'translateX(-50%)', fontSize: '11px',
                color: 'var(--stitch-muted)', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Smartphone size={12} />
              {device.label} — {device.width}x{device.height}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
