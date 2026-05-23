import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Trash2, Lightbulb, Plus, Zap, Brain, Code2, MessageCircle, FolderPlus, Folder } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useWorkflowOperations } from '../../hooks/useWorkflowOperations'
import { NEMOCLAW_CORE_PROFILE } from '../../core/agents/nemoclawCore'

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

const AI_MODELS = [
  { id: 'nvidia-llama', label: 'NVIDIA Llama 2', category: 'LLM', status: 'available' },
  { id: 'nvidia-nemo', label: 'NVIDIA NeMo', category: 'Speech', status: 'available' },
  { id: 'openai-gpt4', label: 'OpenAI GPT-4', category: 'LLM', status: 'available' },
  { id: 'stripe-payment', label: 'Stripe Payment Model', category: 'Payment', status: 'available' },
  { id: 'paypal-payment', label: 'PayPal Integration', category: 'Payment', status: 'available' },
]

const ROOT_WORKFLOWS = [
  { id: 'main-1', name: 'Customer Data Pipeline', description: 'Main ORCA workflow for customer data processing' },
  { id: 'main-2', name: 'Payment Processing Engine', description: 'Centralized payment workflow with multiple providers' },
  { id: 'main-3', name: 'AI Model Orchestration', description: 'Distributed AI model inference and management' },
  { id: 'main-4', name: 'Analytics & Reporting', description: 'System-wide analytics and business intelligence' },
]

export default function AIMode() {
  const { workflow, setWorkflow } = useWorkflowOperations()
  const { addToast } = useToast()
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
  const [projects, setProjects] = useState<any[]>([
    { id: '1', name: 'Email Automation', description: 'Automated email workflows' },
    { id: '2', name: 'Data Pipeline', description: 'Data processing and ETL' },
    { id: '3', name: 'Slack Bot Integration', description: 'Slack automation and notifications' },
  ])
  const [selectedModel, setSelectedModel] = useState<string>('nvidia-llama')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isRootUser, setIsRootUser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check if we have an active project (nodes with content)
  const hasActiveProject = !!workflow && workflow.nodes && workflow.nodes.length > 0

  // Check if user is root (can be detected by email or user role)
  useEffect(() => {
    const userEmail = localStorage.getItem('orca_user_email') || 'joelstalin2105@gmail.com'
    setIsRootUser(userEmail.includes('root') || userEmail === 'joelstalin2105@gmail.com')
  }, [])

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

  const createNewProject = (projectName: string, projectDescription?: string) => {
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: projectName,
      active: false,
      nodes: [
        { id: 'start-1', type: 'default', data: { label: 'Inicio', type: 'trigger', color: '#ff4d42', status: 'pending' }, position: { x: 100, y: 50 } },
      ],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setWorkflow(newWorkflow)
    addToast(`Proyecto "${projectName}" creado`, 'success')
  }

  const selectProject = (project: any) => {
    createNewProject(project.name, project.description)
  }

  // If no active project, show projects list
  if (!hasActiveProject) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'rgb(var(--color-base-100))',
          overflow: 'hidden',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--stitch-text)' }}>
            Bienvenido a ORCA
          </h1>
          <p style={{ color: 'var(--stitch-muted)', fontSize: '16px' }}>
            Selecciona un proyecto o crea uno nuevo para comenzar
          </p>
        </div>

        {/* Create New Project */}
        <button
          onClick={() => {
            const projectName = prompt('Nombre del proyecto:', 'Nuevo Proyecto')
            if (projectName) createNewProject(projectName)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '2px dashed var(--stitch-accent)',
            backgroundColor: 'rgba(124, 77, 255, 0.08)',
            color: 'var(--stitch-accent)',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '32px',
            transition: 'all 0.2s ease',
            maxWidth: '300px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.15)'
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.08)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <FolderPlus size={18} />
          Crear nuevo proyecto
        </button>

        {/* Projects Grid */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--stitch-text)' }}>
            Proyectos disponibles
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => selectProject(project)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--stitch-border)',
                  backgroundColor: 'var(--stitch-elevated)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--stitch-accent)'
                  e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.06)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--stitch-border)'
                  e.currentTarget.style.backgroundColor = 'var(--stitch-elevated)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Folder size={16} style={{ color: 'var(--stitch-accent)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--stitch-text)' }}>
                    {project.name}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--stitch-muted)' }}>
                  {project.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // If project exists, show chat interface
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
        {/* Model Selector */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Modelo IA
          </div>
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid var(--stitch-border)`,
              backgroundColor: 'var(--stitch-hover)',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--stitch-elevated)'
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          >
            {AI_MODELS.find(m => m.id === selectedModel)?.label || 'Select Model'}
          </button>
          {showModelSelector && (
            <div style={{ marginTop: '4px', maxHeight: '150px', overflowY: 'auto' }}>
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setShowModelSelector(false)
                    addToast(`Modelo "${model.label}" seleccionado`, 'info')
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    marginTop: '4px',
                    borderRadius: '6px',
                    border: selectedModel === model.id ? `1px solid var(--stitch-accent)` : `1px solid var(--stitch-border)`,
                    backgroundColor: selectedModel === model.id ? 'rgba(124, 77, 255, 0.1)' : 'transparent',
                    color: 'var(--stitch-text)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selectedModel === model.id ? 'rgba(124, 77, 255, 0.1)' : 'transparent'
                  }}
                >
                  <span>{model.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--stitch-muted)' }}>{model.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--stitch-border)', margin: '8px 0' }} />

        {/* Root User Workflows */}
        {isRootUser && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              🔐 ORCA Workflows
            </div>
            {ROOT_WORKFLOWS.map((wf) => (
              <button
                key={wf.id}
                onClick={() => sendMessage(`Cargar workflow: ${wf.name}`)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(118, 185, 0, 0.28)',
                  backgroundColor: 'rgba(118, 185, 0, 0.06)',
                  color: 'var(--stitch-text)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 185, 0, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(118, 185, 0, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 185, 0, 0.06)'
                  e.currentTarget.style.borderColor = 'rgba(118, 185, 0, 0.28)'
                }}
              >
                <span style={{ fontWeight: 600 }}>{wf.name}</span>
                <span style={{ color: 'var(--stitch-muted)', fontSize: '10px' }}>{wf.description}</span>
              </button>
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--stitch-border)', margin: '8px 0' }} />
          </>
        )}

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

        <div style={{ height: '1px', backgroundColor: 'var(--stitch-border)', margin: '8px 0' }} />
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Agent Core
        </div>
        <div
          style={{
            border: '1px solid rgba(118, 185, 0, 0.28)',
            borderRadius: '8px',
            padding: '10px',
            background: 'rgba(118, 185, 0, 0.06)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--stitch-text)', marginBottom: '4px' }}>
            {NEMOCLAW_CORE_PROFILE.label}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--stitch-muted)', lineHeight: 1.45 }}>
            Sandbox + policy + routed inference. Profiles: {NEMOCLAW_CORE_PROFILE.inferenceProfiles.length}.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {NEMOCLAW_CORE_PROFILE.protectionLayers.map((layer) => (
              <span
                key={layer}
                style={{
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#99F6E4',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                {layer}
              </span>
            ))}
          </div>
        </div>

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
