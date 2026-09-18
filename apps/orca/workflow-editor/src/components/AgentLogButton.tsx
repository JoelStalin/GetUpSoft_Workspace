import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import Popover from './ui/Popover'
import FloatingChatPanel from './FloatingChatPanel'

export default function AgentLogButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      trigger={
        <button
          title="Agent Log"
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '16px',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'var(--stitch-accent)',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(74, 158, 255, 0.3)',
            transition: 'all 0.2s ease',
            zIndex: 35,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 158, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.3)'
          }}
        >
          <MessageCircle size={20} />
        </button>
      }
      side="top"
      align="start"
      onOpenChange={setIsOpen}
    >
      <div
        style={{
          width: '420px',
          height: '380px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <FloatingChatPanel />
      </div>
    </Popover>
  )
}
