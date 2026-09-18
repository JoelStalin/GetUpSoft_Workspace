import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Slash, Mic, Send, Bot } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'agent',
      content: 'What would you like to add or create?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [height, setHeight] = useState(180)
  const [isResizing, setIsResizing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizing(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const newHeight = window.innerHeight - e.clientY

      if (newHeight >= 48 && newHeight <= window.innerHeight * 0.7) {
        setHeight(newHeight)
      }
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInput('')

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I'll help you with that. Let me add ${input} to your workflow.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentResponse])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${isResizing ? 'var(--stitch-accent)' : 'var(--stitch-border)'}`,
        backgroundColor: 'rgb(var(--color-base-100))',
        transition: isResizing ? 'none' : 'border-color 0.2s ease',
      }}
    >
      {/* Drag Handle */}
      <div
        style={{
          height: '4px',
          cursor: 'ns-resize',
          backgroundColor: isResizing ? 'var(--stitch-accent)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid var(--stitch-border)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--stitch-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Bot size={14} />
          <span>Agent Log</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
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
            size={16}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '4px',
              animation: 'slideInUp 0.2s ease-out',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor:
                  msg.role === 'user'
                    ? 'var(--stitch-accent)'
                    : 'var(--stitch-elevated)',
                color:
                  msg.role === 'user'
                    ? '#ffffff'
                    : 'var(--stitch-text)',
                fontSize: '12px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderTop: `1px solid var(--stitch-border)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
          backgroundColor: 'rgb(var(--color-base-100))',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to add or create?"
          style={{
            width: '100%',
            backgroundColor: 'var(--stitch-elevated)',
            border: `1px solid var(--stitch-border)`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'var(--stitch-text)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '80px',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--stitch-accent)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--stitch-border)'
          }}
        />

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <ActionButton icon={Plus} title="Attach" />
            <ActionButton icon={Slash} title="Commands" />
            <button
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'var(--stitch-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              Flash 3 ▼
            </button>
            <ActionButton icon={Mic} title="Mic" />
          </div>
          <button
            onClick={handleSend}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--stitch-accent)',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Send size={12} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  title,
}: {
  icon: any
  title: string
}) {
  return (
    <button
      title={title}
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
      <Icon size={14} />
    </button>
  )
}
