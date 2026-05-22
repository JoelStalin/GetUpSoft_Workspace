import { useState, useRef, useEffect } from 'react'
import { Plus, Slash, Mic, Send, Bot, MessageCircle, Trash2, MessageSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}

const CHAT_STORAGE_KEY = 'orca_chat_history'

const loadChatHistory = (): ChatMessage[] => {
  if (typeof window === 'undefined') return getDefaultMessages()
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load chat history:', e)
  }
  return getDefaultMessages()
}

const getDefaultMessages = (): ChatMessage[] => [
  {
    id: '1',
    role: 'agent',
    content: 'What would you like to add or create?',
    timestamp: new Date().toISOString(),
  },
]

export default function FloatingChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory())
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.warn('Failed to save chat history:', e)
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setInput('')

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I'll help you with that. Let me add ${input} to your workflow.`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, agentResponse])
    }, 500)
  }

  const handleClearHistory = () => {
    if (confirm('¿Limpiar todo el historial de chat?')) {
      setMessages(getDefaultMessages())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header with Clear Button */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: `1px solid var(--stitch-border)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bot size={12} color="var(--stitch-accent)" />
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--stitch-text)' }}>Agent Log</span>
        </div>
        <button
          onClick={handleClearHistory}
          title="Clear chat history"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--stitch-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s ease',
            fontSize: '10px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgb(237, 49, 93)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--stitch-muted)'
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => {
          const msgTime = new Date(msg.timestamp)
          const timeStr = msgTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
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
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #4A9EFF 0%, #2563EB 100%)'
                        : 'var(--stitch-elevated)',
                    color:
                      msg.role === 'user'
                        ? '#ffffff'
                        : 'var(--stitch-text)',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                    boxShadow:
                      msg.role === 'user'
                        ? '0 2px 8px rgba(74, 158, 255, 0.2)'
                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--stitch-muted)',
                    padding: '0 4px',
                  }}
                >
                  {timeStr}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid var(--stitch-border)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
          backgroundColor: 'rgb(var(--color-base-200))',
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
            title="Send message (Enter)"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--stitch-accent)',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
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

      {/* Bot Icon - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--stitch-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 2px 8px rgba(74, 158, 255, 0.3)',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 158, 255, 0.3)'
        }}
      >
        <MessageCircle size={16} color="#ffffff" />
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
