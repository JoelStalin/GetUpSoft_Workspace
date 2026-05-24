import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Trash2, Lightbulb, Plus, Zap, Brain, Code2, MessageCircle, FolderPlus, Folder, Bold, Italic, Code, Image as ImageIcon, Paperclip, Zap as ZapIcon, X } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useWorkflowOperations } from '../../hooks/useWorkflowOperations'
import { NEMOCLAW_CORE_PROFILE } from '../../core/agents/nemoclawCore'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { parseWorkflow, validateWorkflow, describeWorkflow } from '../../utils/workflowParser'
import { generateWorkflow, validateGeneratedWorkflow, summarizeWorkflow } from '../../services/workflowGenerator'
import { aiApiClient, AuthError, RateLimitError, ModelNotFoundError } from '../../services/aiApiClient'
import { getAllModels, getModel, validateModelApiKey } from '../../config/models'

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

const AI_MODELS = getAllModels().map((m) => ({
  id: m.id,
  label: m.name,
  category: m.provider.toUpperCase(),
  status: validateModelApiKey(m.id).valid ? 'available' : 'no-key',
}))

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
  const [isTyping, setIsTyping] = useState(false)
  const [streamTokens, setStreamTokens] = useState(0)
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null)
  const [streamElapsed, setStreamElapsed] = useState(0)
  const [projects, setProjects] = useState<any[]>([
    { id: '1', name: 'Email Automation', description: 'Automated email workflows' },
    { id: '2', name: 'Data Pipeline', description: 'Data processing and ETL' },
    { id: '3', name: 'Slack Bot Integration', description: 'Slack automation and notifications' },
  ])
  const [selectedModel, setSelectedModel] = useState<string>('nvidia-llama2-70b')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isRootUser, setIsRootUser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Describe el flujo de automatización que necesitas...' }),
      Image,
    ],
    content: '',
  })

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

  // Timer for streaming elapsed time
  useEffect(() => {
    if (!isTyping || streamStartTime === null) return
    const timer = setInterval(() => {
      setStreamElapsed(Date.now() - streamStartTime)
    }, 100)
    return () => clearInterval(timer)
  }, [isTyping, streamStartTime])

  const sendMessage = useCallback(async (text?: string) => {
    const contentToSend = text || editor?.getHTML() || ''
    const plainText = editor?.getText() || ''
    if (!plainText.trim()) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: plainText.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    editor?.commands.clearContent()
    setIsTyping(true)
    setStreamTokens(0)
    setStreamStartTime(null)
    setStreamElapsed(0)

    // Parse workflow intent from user message
    const workflowIntent = parseWorkflow(plainText.trim())

    let agentResponseContent = ''
    let workflowCreated = false

    // Check for workflow creation intent
    if (workflowIntent.type === 'create' && workflowIntent.nodes.length > 0) {
      // Validate parsed workflow
      const validation = validateWorkflow(workflowIntent)

      if (validation.valid) {
        try {
          // Generate workflow nodes and edges
          const generatedWorkflow = generateWorkflow({
            nodes: workflowIntent.nodes,
            edges: workflowIntent.edges,
          })

          // Validate generated workflow
          const generationValidation = validateGeneratedWorkflow(generatedWorkflow)

          if (generationValidation.valid && workflow) {
            // Update workflow with new nodes and edges
            const updatedWorkflow = {
              ...workflow,
              nodes: [...(workflow.nodes || []), ...generatedWorkflow.nodes],
              edges: [...(workflow.edges || []), ...generatedWorkflow.edges],
              updatedAt: new Date().toISOString(),
            }

            setWorkflow(updatedWorkflow)
            workflowCreated = true

            const summary = summarizeWorkflow(generatedWorkflow)
            agentResponseContent = `✅ Workflow creado exitosamente! ${summary}. Los nodos aparecen en el canvas. Puedes editarlos o conectarlos según sea necesario.`
          } else {
            agentResponseContent = `⚠️ Error al generar el workflow: ${generationValidation.errors.join(', ')}`
          }
        } catch (error) {
          agentResponseContent = `❌ Error al procesar tu solicitud: ${String(error)}`
        }
      } else {
        agentResponseContent = `❓ No pude interpretar completamente tu workflow. ${describeWorkflow(workflowIntent)}. ${validation.reason}`
      }

      // Workflow was handled, show response and return
      await new Promise((r) => setTimeout(r, 600))
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'agent',
        content: agentResponseContent,
        timestamp: new Date().toISOString(),
      }
      setMessages((m) => [...m, agentMsg])
      if (workflowCreated) {
        addToast('Workflow creado con nodos automáticos', 'success')
      }
      setIsTyping(false)
      return
    }

    // Not a workflow creation - use real AI API
    try {
      // Validate model has API key
      const modelValidation = validateModelApiKey(selectedModel)
      if (!modelValidation.valid) {
        agentResponseContent = `⚠️ Modelo no configurado: ${modelValidation.error}\n\nPor favor, configura las variables de entorno necesarias.`
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'agent', content: agentResponseContent, timestamp: new Date().toISOString() }])
        setIsTyping(false)
        addToast('API key no configurada', 'error')
        return
      }

      // Create placeholder message for streaming response
      const agentMsgId = `a-${Date.now()}`
      let streamedContent = ''
      setStreamStartTime(Date.now())

      setMessages((m) => [
        ...m,
        {
          id: agentMsgId,
          role: 'agent',
          content: '▌',
          timestamp: new Date().toISOString(),
        },
      ])

      // Stream response from API
      const stream = aiApiClient.streamMessage({
        modelId: selectedModel,
        messages: [
          ...messages.map((m) => ({
            role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.content,
          })),
          {
            role: 'user',
            content: plainText.trim(),
          },
        ],
        temperature: 0.7,
        maxTokens: 2048,
      })

      for await (const chunk of stream) {
        streamedContent += chunk
        const newTokens = estimateTokens(streamedContent)
        setStreamTokens(newTokens)

        setMessages((m) => {
          const updated = [...m]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg && lastMsg.id === agentMsgId) {
            lastMsg.content = streamedContent || '▌'
          }
          return updated
        })
      }

      // Update final message
      setMessages((m) => {
        const updated = [...m]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg && lastMsg.id === agentMsgId) {
          lastMsg.content = streamedContent
        }
        return updated
      })

      addToast('Respuesta completada', 'success')
    } catch (error) {
      let errorMsg = 'Error desconocido'

      if (error instanceof AuthError) {
        errorMsg = `Error de autenticación: ${error.message}`
        addToast('Verifica tu API key', 'error')
      } else if (error instanceof RateLimitError) {
        errorMsg = `Límite de velocidad excedido: Intenta nuevamente en unos segundos`
        addToast('Rate limit alcanzado', 'warning')
      } else if (error instanceof ModelNotFoundError) {
        errorMsg = `Modelo no encontrado: ${error.message}`
        addToast('Modelo no disponible', 'error')
      } else if (error instanceof Error) {
        errorMsg = `Error: ${error.message}`
        addToast('Error en la API', 'error')
      }

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'agent',
          content: `❌ ${errorMsg}`,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }, [editor, workflow, setWorkflow, addToast, selectedModel, messages])

  const clearHistory = () => {
    setMessages(defaultMessages())
    addToast('Conversación reiniciada', 'info')
  }

  const handleCancelStream = () => {
    aiApiClient.cancelStream()
    setIsTyping(false)
    setStreamTokens(0)
    setStreamStartTime(null)
    setStreamElapsed(0)
    addToast('Response interrupted', 'info')
  }

  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4)
  }

  const createNewProject = (projectName: string, projectDescription?: string) => {
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: projectName,
      active: false,
      nodes: [
        { id: 'start-1', type: 'default', data: { label: 'Inicio', type: 'trigger', color: '#ff4d42', status: 'pending' as const }, position: { x: 100, y: 50 } },
      ],
      edges: [],
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setWorkflow(newWorkflow as any)
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
                {msg.role === 'agent' && isTyping && streamTokens > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--stitch-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--stitch-border)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span title="Token count">⚡ {streamTokens}</span>
                    <span title="Cost">💰 ${(streamTokens * (getModel(selectedModel)?.costPerToken || 0)).toFixed(6)}</span>
                    <span title="Elapsed time">⏱️ {(streamElapsed / 1000).toFixed(1)}s</span>
                  </div>
                )}
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
          {/* Formatting Toolbar */}
          {editor && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '8px',
                borderRadius: '8px 8px 0 0',
                backgroundColor: 'var(--stitch-hover)',
                borderBottom: '1px solid var(--stitch-border)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: editor.isActive('bold') ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                  color: editor.isActive('bold') ? 'var(--stitch-accent)' : 'var(--stitch-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Bold (Ctrl+B)"
              >
                <Bold size={14} />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: editor.isActive('italic') ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                  color: editor.isActive('italic') ? 'var(--stitch-accent)' : 'var(--stitch-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Italic (Ctrl+I)"
              >
                <Italic size={14} />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: editor.isActive('code') ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                  color: editor.isActive('code') ? 'var(--stitch-accent)' : 'var(--stitch-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Inline Code"
              >
                <Code size={14} />
              </button>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--stitch-border)', margin: '0 4px' }} />

              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: editor.isActive('bulletList') ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                  color: editor.isActive('bulletList') ? 'var(--stitch-accent)' : 'var(--stitch-text)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Bullet List"
              >
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>•</span>
              </button>

              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: editor.isActive('orderedList') ? 'rgba(124, 77, 255, 0.2)' : 'transparent',
                  color: editor.isActive('orderedList') ? 'var(--stitch-accent)' : 'var(--stitch-text)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Numbered List"
              >
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>1.</span>
              </button>

              <div style={{ marginLeft: 'auto' }} />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--stitch-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Attach File"
              >
                <Paperclip size={14} />
              </button>

              <button
                onClick={() => {
                  const url = prompt('Ingresa la URL de la imagen:')
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run()
                  }
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--stitch-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Insert Image"
              >
                <ImageIcon size={14} />
              </button>
            </div>
          )}

          {/* Editor */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
              padding: '12px 16px',
              borderRadius: '0 0 12px 12px',
              border: '1px solid var(--stitch-border)',
              borderTop: 'none',
              backgroundColor: 'var(--stitch-elevated)',
              transition: 'border-color 0.15s ease',
              minHeight: '60px',
            }}
            onFocusCapture={(e) => {
              const border = e.currentTarget as HTMLElement
              border.style.borderColor = 'var(--stitch-accent)'
            }}
            onBlurCapture={(e) => {
              const border = e.currentTarget as HTMLElement
              border.style.borderColor = 'var(--stitch-border)'
            }}
          >
            <div
              style={{
                flex: 1,
                color: 'var(--stitch-text)',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              {editor && (
                <EditorContent
                  editor={editor}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && editor.getText().trim()) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
              )}
            </div>

            {isTyping ? (
              <button
                onClick={handleCancelStream}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF5252'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF6B6B'
                }}
                title="Cancel response"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!editor || !editor.getText().trim() || isTyping}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: editor && editor.getText().trim() && !isTyping ? 'var(--stitch-accent)' : 'var(--stitch-hover)',
                  color: editor && editor.getText().trim() && !isTyping ? '#fff' : 'var(--stitch-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: editor && editor.getText().trim() && !isTyping ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={14} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--stitch-muted)', marginTop: '8px', textAlign: 'center' }}>
            Enter para enviar · Shift+Enter para nueva línea
          </div>
        </div>

        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => addToast('File upload coming soon', 'info')} />
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .ProseMirror {
          outline: none;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .ProseMirror p {
          margin: 0;
        }

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 20px;
          margin: 6px 0;
        }

        .ProseMirror code {
          background-color: rgba(124, 77, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          color: var(--stitch-accent);
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--stitch-muted);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
