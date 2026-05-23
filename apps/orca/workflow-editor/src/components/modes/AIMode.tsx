import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Trash2, Lightbulb, Plus, Zap, Brain, Code2, MessageCircle } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}

const AI_STORAGE_KEY = 'orca_ai_mode_history'

const defaultMessages = (): ChatMessage[] => [
  {
    id: '1',
    role: 'agent',
    content: 'Hola, soy el orquestador ORCA. ¿Qué flujo de automatización quieres construir hoy?',
    timestamp: new Date().toISOString(),
  },
]

const QUICK_PROMPTS = [
  { icon: Zap, label: 'Crear workflow', prompt: 'Crea un workflow que procese datos de un webhook y envíe un email de notificación' },
  { icon: Brain, label: 'Analizar datos', prompt: 'Necesito un agente que analice datos de una API y genere un reporte' },
  { icon: Code2, label: 'Automatizar tarea', prompt: 'Quiero automatizar la extracción de datos de un formulario web' },
  { icon: MessageCircle, label: 'Integrar API', prompt: 'Ayúdame a integrar Slack con mi workflow actual' },
]

export default function AIMode() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(AI_STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultMessages()
    } catch {
      return defaultMessages()
    }
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { addToast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(messages))
    } catch { /* ignore */ }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response — replace with real API call
    await new Promise((r) => setTimeout(r, 1200))
    const agentMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'agent',
      content: `Entendido. Para esa tarea puedo generar un workflow con los nodos necesarios. ¿Quieres que lo agregue directamente al canvas de Workflow?`,
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, agentMsg])
    setIsTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearHistory = () => {
    setMessages(defaultMessages())
    addToast('Conversación reiniciada', 'info')
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: 'rgb(var(--color-base-100))',
        overflow: 'hidden',
      }}
    >
      {/* Left Sidebar — AI Actions */}
      <div
        style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--stitch-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          gap: '8px',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          Acciones rápidas
        </div>
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => sendMessage(prompt)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--stitch-border)',
              backgroundColor: 'transparent',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          >
            <Icon size={14} style={{ color: 'var(--stitch-accent)', flexShrink: 0 }} />
            {label}
          </button>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={clearHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--stitch-border)',
              backgroundColor: 'transparent',
              color: 'var(--stitch-muted)',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF6B6B'
              e.currentTarget.style.borderColor = '#FF6B6B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--stitch-muted)'
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          >
            <Trash2 size={13} />
            Limpiar chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                maxWidth: '800px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: msg.role === 'agent' ? 'rgba(124, 77, 255, 0.15)' : 'rgba(74, 158, 255, 0.15)',
                  border: `1px solid ${msg.role === 'agent' ? 'rgba(124, 77, 255, 0.3)' : 'rgba(74, 158, 255, 0.3)'}`,
                }}
              >
                {msg.role === 'agent' ? <Bot size={16} style={{ color: '#7c4dff' }} /> : <Lightbulb size={14} style={{ color: '#4A9EFF' }} />}
              </div>

              {/* Bubble */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  backgroundColor: msg.role === 'agent' ? 'var(--stitch-elevated)' : 'rgba(124, 77, 255, 0.12)',
                  border: `1px solid ${msg.role === 'agent' ? 'var(--stitch-border)' : 'rgba(124, 77, 255, 0.2)'}`,
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--stitch-text)',
                  maxWidth: '560px',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(124, 77, 255, 0.15)',
                  border: '1px solid rgba(124, 77, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={16} style={{ color: '#7c4dff' }} />
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '4px 16px 16px 16px',
                  backgroundColor: 'var(--stitch-elevated)',
                  border: '1px solid var(--stitch-border)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--stitch-muted)',
                      animation: 'typingBounce 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '16px 32px 24px',
            borderTop: '1px solid var(--stitch-border)',
            backgroundColor: 'rgb(var(--color-base-100))',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--stitch-border)',
              backgroundColor: 'var(--stitch-elevated)',
              transition: 'border-color 0.15s ease',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe el flujo de automatización que necesitas... (Enter para enviar)"
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--stitch-text)',
                fontSize: '13px',
                lineHeight: '1.5',
                resize: 'none',
                maxHeight: '120px',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: input.trim() && !isTyping ? 'var(--stitch-accent)' : 'var(--stitch-hover)',
                color: input.trim() && !isTyping ? '#fff' : 'var(--stitch-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--stitch-muted)', marginTop: '8px', textAlign: 'center' }}>
            Enter para enviar · Shift+Enter para nueva línea
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
