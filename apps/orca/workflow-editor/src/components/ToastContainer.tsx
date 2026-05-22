import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="#1DB954" />
      case 'error':
        return <AlertCircle size={18} color="#ed315d" />
      case 'warning':
        return <AlertTriangle size={18} color="#ff9f43" />
      case 'info':
      default:
        return <Info size={18} color="#4A9EFF" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(29, 185, 84, 0.1)'
      case 'error':
        return 'rgba(237, 49, 93, 0.1)'
      case 'warning':
        return 'rgba(255, 159, 67, 0.1)'
      case 'info':
      default:
        return 'rgba(74, 158, 255, 0.1)'
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#1DB954'
      case 'error':
        return '#ed315d'
      case 'warning':
        return '#ff9f43'
      case 'info':
      default:
        return '#4A9EFF'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
            backgroundColor: getBackgroundColor(toast.type),
            border: `1px solid ${getBorderColor(toast.type)}`,
            borderRadius: '8px',
            color: 'var(--stitch-text)',
            fontSize: '12px',
            fontWeight: 500,
            pointerEvents: 'auto',
            animation: 'slideInUp 0.3s ease-out',
            backdropFilter: 'blur(8px)',
            maxWidth: '300px',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          <div style={{ flexShrink: 0, display: 'flex' }}>
            {getIcon(toast.type)}
          </div>
          <div style={{ flex: 1 }}>
            {toast.message}
          </div>
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
              flexShrink: 0,
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
      ))}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes slideInUp {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  )
}
