import { useToast } from '../contexts/ToastContext'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: { bg: 'rgba(29, 185, 84, 0.15)', border: 'var(--stitch-green)', icon: 'var(--stitch-green)' },
    error: { bg: 'rgba(255, 109, 90, 0.15)', border: 'rgb(255, 109, 90)', icon: 'rgb(255, 109, 90)' },
    info: { bg: 'rgba(74, 158, 255, 0.15)', border: 'var(--stitch-accent)', icon: 'var(--stitch-accent)' },
    warning: { bg: 'rgba(255, 159, 67, 0.15)', border: 'rgb(255, 159, 67)', icon: 'rgb(255, 159, 67)' },
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        const color = colors[toast.type]

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
              animation: 'slideInUp 0.3s ease',
              pointerEvents: 'auto',
              minWidth: '300px',
            }}
          >
            <Icon size={18} style={{ color: color.icon, flexShrink: 0 }} />
            <span
              style={{
                flex: 1,
                fontSize: '13px',
                color: 'var(--stitch-text)',
                fontWeight: 500,
              }}
            >
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
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
              <X size={16} />
            </button>
          </div>
        )
      })}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
