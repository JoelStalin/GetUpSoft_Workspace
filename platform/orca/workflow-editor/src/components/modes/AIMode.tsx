import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import { aiApiClient, AuthError, RateLimitError, ModelNotFoundError, TimeoutError, AllProvidersFailedError } from '../../services/aiApiClient'
import { getAllModels, getModel, validateModelApiKey } from '../../config/models'
import { resolveProductName, getRecentTemplates, saveTemplate } from '../../utils/invoiceIntentParser'

interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}
interface InvoiceIntentData {
  productName: string | null
  customerName: string | null
  price: number | null
  showProcess: boolean
}

interface PendingPriceConfirmation {
  productName: string
  customerName: string
  requestedPrice: number
  existingPrice: number
  showProcess: boolean
}

interface PendingExistingPriceDecision {
  productName: string
  customerName: string
  existingPrice: number
  showProcess: boolean
}

interface PendingInvoiceDraft extends InvoiceIntentData {
  waitingFor: 'productName' | 'customerName' | 'price'
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [isRunningOdooE2E, setIsRunningOdooE2E] = useState(false)
  const [odooLiveSteps, setOdooLiveSteps] = useState<string[]>([])
  const [showOdooLiveIframe, setShowOdooLiveIframe] = useState(false)
  const [odooLiveIframeSrc, setOdooLiveIframeSrc] = useState('')
  const [odooLiveFrameSrc, setOdooLiveFrameSrc] = useState('')
  const [odooLiveCurrentStep, setOdooLiveCurrentStep] = useState('Esperando')
  const [canvasPortalTarget, setCanvasPortalTarget] = useState<HTMLElement | null>(null)
  const [liveIframeError, setLiveIframeError] = useState<string | null>(null)
  const [liveRenderMode, setLiveRenderMode] = useState<'iframe' | 'step-viewer'>('step-viewer')
  const [liveFramePos, setLiveFramePos] = useState({ x: 320, y: 96 })
  const [liveFrameSize, setLiveFrameSize] = useState({ w: 980, h: 600 })
  const [liveFrameMaximized, setLiveFrameMaximized] = useState(false)
  const [liveFramePrev, setLiveFramePrev] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [pendingPriceConfirmation, setPendingPriceConfirmation] = useState<PendingPriceConfirmation | null>(null)
  const [pendingExistingPriceDecision, setPendingExistingPriceDecision] = useState<PendingExistingPriceDecision | null>(null)
  const [pendingInvoiceDraft, setPendingInvoiceDraft] = useState<PendingInvoiceDraft | null>(null)
  const [localProjectActivated, setLocalProjectActivated] = useState(false)
  const tutorialPollRef = useRef<number | null>(null)
  const dragRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 })
  const resizeRef = useRef<{ active: boolean; sx: number; sy: number; w: number; h: number }>({ active: false, sx: 0, sy: 0, w: 980, h: 600 })
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
  const hasActiveProject = localProjectActivated || (!!workflow && workflow.nodes && workflow.nodes.length > 0)

  // Check if user is root (can be detected by email or user role)
  useEffect(() => {
    const userEmail = localStorage.getItem('orca_user_email') || 'joelstalin2105@gmail.com'
    setIsRootUser(userEmail.includes('root') || userEmail === 'joelstalin2105@gmail.com')
  }, [])

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      addToast('Conexión restaurada', 'success')
    }
    const handleOffline = () => {
      setIsOnline(false)
      addToast('Sin conexión a internet', 'warning')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addToast])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messages.length > 140) {
      setMessages(messages.slice(-120))
      return
    }
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(messages))
    } catch { /* ignore */ }
  }, [messages])

  useEffect(() => {
    const resolveTarget = () => {
      const target =
        (document.querySelector('#root > div > div:nth-child(4) > div > div > div.react-flow__renderer > div') as HTMLElement | null) ||
        (document.querySelector('.react-flow__renderer > div') as HTMLElement | null) ||
        (document.querySelector('.react-flow__viewport') as HTMLElement | null)
      setCanvasPortalTarget(target)
    }
    resolveTarget()
    const observer = new MutationObserver(() => resolveTarget())
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setInterval(resolveTarget, 1200)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  // Timer for streaming elapsed time
  useEffect(() => {
    if (!isTyping || streamStartTime === null) return
    const timer = setInterval(() => {
      setStreamElapsed(Date.now() - streamStartTime)
    }, 100)
    return () => clearInterval(timer)
  }, [isTyping, streamStartTime])

  const normalizeText = (value: string): string =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const levenshtein = (a: string, b: string): number => {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
    for (let i = 0; i <= a.length; i++) dp[i][0] = i
    for (let j = 0; j <= b.length; j++) dp[0][j] = j
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      }
    }
    return dp[a.length][b.length]
  }

  const fuzzyHas = (text: string, keyword: string): boolean => {
    const norm = normalizeText(text)
    const key = normalizeText(keyword)
    if (norm.includes(key)) return true
    return norm.split(' ').some((w) => Math.abs(w.length - key.length) <= 2 && levenshtein(w, key) <= 2)
  }

  const rewriteProductWithMemory = (productName: string): { productName: string; notes: string[] } => {
    const notes: string[] = []
    const aliases = [
      { canonical: 'Pepsi', variants: ['pesi', 'pepsi', 'pepsy'] },
      { canonical: 'Coca Cola', variants: ['cocalola', 'cocaola', 'cocacola', 'coka cola'] },
      { canonical: 'Sprite', variants: ['sprayte', 'spritee', 'esprite'] },
    ]

    let rewritten = productName
    const words = productName.split(/\s+/)
    const rewrittenWords = words.map((word) => {
      const normalizedWord = normalizeText(word)
      const match = aliases.find((alias) =>
        alias.variants.some((variant) => {
          const normalizedVariant = normalizeText(variant)
          return normalizedWord === normalizedVariant ||
            (Math.abs(normalizedWord.length - normalizedVariant.length) <= 1 && levenshtein(normalizedWord, normalizedVariant) <= 1)
        }),
      )
      if (!match) return word
      if (normalizeText(word) !== normalizeText(match.canonical)) {
        notes.push(`Producto normalizado por memoria: "${word}" -> "${match.canonical}".`)
      }
      return match.canonical
    })

    rewritten = rewrittenWords.join(' ').replace(/\s+/g, ' ').trim()
    return { productName: rewritten, notes: [...new Set(notes)] }
  }

  const resolveInvoiceIntentWithMemory = (details: InvoiceIntentData): { details: InvoiceIntentData; notes: string[] } => {
    if (!details.productName) return { details, notes: [] }

    // Use enhanced fuzzy matching first
    const fuzzyResolution = resolveProductName(details.productName)
    if (fuzzyResolution.matched) {
      return {
        details: { ...details, productName: fuzzyResolution.resolved },
        notes: fuzzyResolution.notes,
      }
    }

    // Fall back to legacy memory-based rewrite
    const productRewrite = rewriteProductWithMemory(details.productName)
    if (productRewrite.productName === details.productName && productRewrite.notes.length === 0) {
      return { details, notes: [] }
    }
    return {
      details: { ...details, productName: productRewrite.productName },
      notes: productRewrite.notes,
    }
  }

  const inferAutonomousIntent = (text: string): 'invoice_e2e' | 'general_ai' => {
    const invoice = ['factura', 'invoice', 'facturacion', 'facturar'].some((k) => fuzzyHas(text, k))
    const business = ['producto', 'prodcto', 'prodcuto', 'lista', 'cliente', 'clinte', 'venta', 'pago', 'pdf', 'imprimir']
      .some((k) => fuzzyHas(text, k))
    return invoice && business ? 'invoice_e2e' : 'general_ai'
  }

  const isAffirmative = (text: string): boolean => {
    const normalized = normalizeText(text)
    return ['si', 'sí', 'yes', 'ok', 'confirmo', 'claro', 'modificalo', 'modificar', 'actualizar']
      .some((k) => normalized.includes(normalizeText(k)))
  }

  const isNegative = (text: string): boolean => {
    const normalized = normalizeText(text)
    return ['no', 'cancelar', 'mantener', 'dejar', 'no modificar']
      .some((k) => normalized.includes(normalizeText(k)))
  }

  const extractAmountFromText = (text: string): number | null => {
    const patterns = [
      /(?:monto|valor|precio)\s*(?:de|:)?\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /(?:de)\s+\$?\s*([0-9]+(?:[.,][0-9]+)?)(?=\s|$|[.,;])/i,
      /(?:por|a)\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /\$\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /^\s*([0-9]+(?:[.,][0-9]+)?)\s*$/i,
    ]
    for (const re of patterns) {
      const m = text.match(re)
      if (m?.[1]) {
        const n = Number(m[1].replace(',', '.'))
        if (!Number.isNaN(n) && n > 0) return n
      }
    }
    return null
  }

  const stripEntityNoise = (value: string | undefined | null): string => {
    let cleaned = (value || '')
      .replace(/\s+(?:de|por|a|valor|precio|monto)\s*\$?\s*[0-9]+(?:[.,][0-9]+)?\b.*$/i, '')
      .replace(/\s+(?:y\s+)?(?:muestrame|mu[eé]strame|mostrar|ver|live|proceso|paso\s+a\s+paso|navegador|confirmar|confirma|registrar|registra|pago|descargar|descarga|pdf)\b.*$/i, '')
      .replace(/[.,;:]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    let previous = ''
    while (cleaned !== previous) {
      previous = cleaned
      cleaned = cleaned
        .replace(/^(?:para|de|del|al|a|con)\s+/i, '')
        .replace(/^(?:un|una|uno|el|la|los|las)\s+/i, '')
        .trim()
    }
    return cleaned
  }

  const cleanEntityName = (value: string | undefined | null, kind: 'product' | 'customer'): string | null => {
    const cleaned = stripEntityNoise(value)
    if (cleaned.length < 2) return null
    const normalized = normalizeText(cleaned)
    const genericCustomer = [
      'nuevo',
      'nueva',
      'cliente nuevo',
      'un cliente nuevo',
      'crear cliente nuevo',
      'cliente',
      'por',
      'para',
      'con',
      'y',
      'valor',
      'precio',
      'monto',
      'de una',
      'de un',
    ]
    const genericProduct = [
      'producto',
      'un producto',
      'lista de producto',
      'lista de productos',
      'completa',
      'completo',
      'start to end',
      'una',
      'un',
    ]
    if (kind === 'customer' && genericCustomer.includes(normalized)) return null
    if (kind === 'product' && genericProduct.includes(normalized)) return null
    if (kind === 'product' && (normalized.includes('lista de producto') || normalized.endsWith(' de'))) return null
    return cleaned
  }

  const extractInvoiceIntentData = (prompt: string): InvoiceIntentData => {
    const text = prompt.trim()
    const showProcess = ['muestrame', 'mostrar', 'ver', 'live', 'proceso', 'paso a paso', 'navegador']
      .some((k) => fuzzyHas(text, k))
    const price = extractAmountFromText(text)

    const relationMatch = text.match(
      /(?:cliente|clinte)\s+([^.,;!?]{2,80}?)\s+(?:de|con)\s+(?:un|una|uno|el|la|los|las)?\s*([^.,;!?]{2,100}?)(?=\s+(?:de|por|a|valor|precio|monto)\s*\$?\s*[0-9]+|\s+(?:y\s+)?(?:muestrame|mu[eé]strame|mostrar|ver|live|proceso|paso|navegador|confirmar|confirma|registrar|registra|pago|descargar|descarga|pdf)\b|$)/i,
    )

    const productMatch =
      text.match(/(?:producto|prodcto|prodcuto|articulo|artículo|item)\s*[:\-]?\s*(?:llamado|llamada|nombre)?\s*([^.,;!?]{2,100}?)(?=\s+(?:cliente|clinte|valor|precio|monto|por\s*\$?[0-9]|de\s*\$?[0-9]|a\s*\$?[0-9]|para|con|y\s+(?:mostrar|muestrame|mu[eé]strame|ver|live|proceso)|$))/i) ||
      text.match(/(?:factura|facturar)\s+(?:para|de)?\s*([^.,;!?]{2,100}?)(?=\s+(?:cliente|clinte|valor|precio|monto|por\s*\$?[0-9]|de\s*\$?[0-9]|a\s*\$?[0-9]|con|y\s+(?:mostrar|muestrame|mu[eé]strame|ver|live|proceso)|$))/i)
    const customerMatch = text.match(
      /(?:cliente|clinte)\s*[:\-]?\s*(?:llamado|llamada|nombre)?\s*([^.,;!?]{2,80}?)(?=\s+(?:producto|prodcto|prodcuto|articulo|artículo|item|de\s+(?:un|una|uno|el|la|los|las)|con\s+(?:un|una|uno|el|la|los|las)|valor|precio|monto|por\s*\$?[0-9]|a\s*\$?[0-9]|y\s+(?:mostrar|muestrame|mu[eé]strame|ver|live|proceso)|$))/i,
    )

    return {
      productName: cleanEntityName(relationMatch?.[2] || productMatch?.[1], 'product'),
      customerName: cleanEntityName(relationMatch?.[1] || customerMatch?.[1], 'customer'),
      price,
      showProcess,
    }
  }

  const getMissingInvoiceField = (details: InvoiceIntentData): PendingInvoiceDraft['waitingFor'] | null => {
    if (!details.productName) return 'productName'
    if (!details.customerName) return 'customerName'
    if (!details.price) return 'price'
    return null
  }

  const invoiceMissingMessage = (
    field: PendingInvoiceDraft['waitingFor'],
    context?: { customerName?: string; productName?: string; price?: number }
  ) => {
    if (field === 'productName') {
      if (context?.customerName) {
        return `¿Qué producto deseas facturar para el cliente ${context.customerName}?`
      }
      return '¿Cuál es el nombre del producto para la factura?'
    }
    if (field === 'customerName') {
      if (context?.productName) {
        return `¿Para qué cliente debo emitir la factura de ${context.productName}?`
      }
      return '¿Cuál es el nombre del cliente para esta factura?'
    }
    return context?.productName && context?.customerName
      ? `¿Cuál es el monto o precio de ${context.productName} para ${context.customerName}?`
      : '¿Cuál es el monto o precio unitario del producto?'
  }

  const mergeInvoiceDetails = (previous: PendingInvoiceDraft | null, text: string): InvoiceIntentData => {
    const parsed = extractInvoiceIntentData(text)
    const typed = text.trim()
    return {
      productName: parsed.productName || (previous?.waitingFor === 'productName' ? typed : previous?.productName || null),
      customerName: parsed.customerName || (previous?.waitingFor === 'customerName' ? typed : previous?.customerName || null),
      price: parsed.price || previous?.price || null,
      showProcess: Boolean(parsed.showProcess || previous?.showProcess),
    }
  }

  const lookupOdooProduct = async (productName: string): Promise<{ exists: boolean; listPrice: number | null } | null> => {
    try {
      const checkResp = await fetch('/api/orca/odoo-product-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName }),
      })
      const checkData = await checkResp.json()
      if (!checkResp.ok || !checkData?.ok) return null
      return {
        exists: Boolean(checkData.exists),
        listPrice: typeof checkData.list_price === 'number' ? Number(checkData.list_price) : null,
      }
    } catch {
      return null
    }
  }

  const lookupOdooCustomer = async (customerName: string): Promise<{ exists: boolean; id?: number; email?: string } | null> => {
    try {
      const checkResp = await fetch('/api/orca/odoo-customer-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName }),
      })
      const checkData = await checkResp.json()
      if (!checkResp.ok || !checkData?.ok) return null
      return {
        exists: Boolean(checkData.exists),
        id: typeof checkData.id === 'number' ? checkData.id : undefined,
        email: typeof checkData.email === 'string' ? checkData.email : undefined,
      }
    } catch {
      return null
    }
  }

  const showExistingPriceDecisionInLive = (data: PendingExistingPriceDecision) => {
    setShowOdooLiveIframe(true)
    setLiveIframeError(null)
    setLiveRenderMode('step-viewer')
    setOdooLiveCurrentStep('Precio existente detectado')
    setOdooLiveSteps((prev) => [
      ...prev,
      `Producto detectado: ${data.productName}`,
      `Precio actual en Odoo: ${data.existingPrice.toFixed(2)}`,
      'ORCA espera confirmación: usar ese valor o recibir un nuevo monto.',
    ])
    upsertLiveNode('running', `Producto existente ${data.productName}: precio ${data.existingPrice.toFixed(2)}`)
  }

  const shouldUseExistingPrice = (text: string): boolean => {
    const normalized = normalizeText(text)
    return ['usar', 'usa', 'mantener', 'actual', 'mismo', 'ese valor', 'valor actual']
      .some((k) => normalized.includes(normalizeText(k))) || isAffirmative(text)
  }

  const isLiveFrameImage = (src: string): boolean =>
    src.startsWith('/api/orca/odoo-live-tutorial/frame/') ||
    src.startsWith('data:image/') ||
    /\.(png|jpe?g|webp|gif)(\?|$)/i.test(src)

  const getOdooDb = (): string => ((import.meta as any).env?.VITE_ODOO_DB || 'odoo')

  const odooWebUrl = (path: string): string => path

  const ensureOdooWebSession = async (): Promise<void> => {
    const env = (import.meta as any).env || {}
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
    const db = getOdooDb()
    const login = env.VITE_ODOO_USER || (isLocalHost ? 'admin' : '')
    const password = env.VITE_ODOO_PASSWORD || (isLocalHost ? 'admin' : '')
    if (!login || !password) return
    await fetch(`/web/session/authenticate?db=${encodeURIComponent(db)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: { db, login, password },
        id: Date.now(),
      }),
    }).catch(() => undefined)
  }

  const executeInvoiceWorkflow = async (details: InvoiceIntentData, sourceText: string) => {
    const interpretation = resolveInvoiceIntentWithMemory(details)
    const effectiveDetails = interpretation.details

    if (interpretation.notes.length > 0) {
      setOdooLiveSteps((prev) => [...prev, ...interpretation.notes.map((note) => `Normalización: ${note}`)])
      const correctionText = interpretation.notes
        .map((note) => {
          if (note.includes('Producto normalizado')) {
            return `✓ ${note}`
          }
          return note
        })
        .join('\n')
      setMessages((m) => [
        ...m,
        {
          id: `a-research-${Date.now()}`,
          role: 'agent',
          content: `Detecté y normalicé los datos de tu solicitud:\n${correctionText}`,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    if (!effectiveDetails.productName || !effectiveDetails.customerName) {
      const missing = getMissingInvoiceField(effectiveDetails)
      if (!missing) return
      setPendingInvoiceDraft({ ...effectiveDetails, waitingFor: missing })
      setMessages((m) => [
        ...m,
        {
          id: `a-missing-${Date.now()}`,
          role: 'agent',
          content: invoiceMissingMessage(missing, effectiveDetails),
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    const productCheck = await lookupOdooProduct(effectiveDetails.productName)
    const customerCheck = await lookupOdooCustomer(effectiveDetails.customerName)

    if (!customerCheck?.exists) {
      setMessages((m) => [
        ...m,
        {
          id: `a-customer-info-${Date.now()}`,
          role: 'agent',
          content: `El cliente "${effectiveDetails.customerName}" no existe en Odoo. Crearé uno automáticamente con la información disponible.`,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    if (!effectiveDetails.price) {
      if (productCheck?.exists && typeof productCheck.listPrice === 'number' && productCheck.listPrice > 0) {
        const pendingData = {
          productName: effectiveDetails.productName,
          customerName: effectiveDetails.customerName,
          existingPrice: productCheck.listPrice,
          showProcess: effectiveDetails.showProcess,
        }
        setPendingExistingPriceDecision(pendingData)
        showExistingPriceDecisionInLive(pendingData)
        setMessages((m) => [
          ...m,
          {
            id: `a-existing-price-${Date.now()}`,
            role: 'agent',
            content: `El producto "${details.productName}" ya tiene un valor en Odoo (${productCheck.listPrice.toFixed(2)}). ¿Quieres usar ese valor o indicar otro monto?`,
            timestamp: new Date().toISOString(),
          },
        ])
        return
      }
      setPendingInvoiceDraft({ ...effectiveDetails, waitingFor: 'price' })
      setMessages((m) => [
        ...m,
        {
          id: `a-missing-${Date.now()}`,
          role: 'agent',
          content: invoiceMissingMessage('price', effectiveDetails),
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    if (productCheck?.exists && typeof productCheck.listPrice === 'number') {
      const existingPrice = Number(productCheck.listPrice)
      if (Math.abs(existingPrice - effectiveDetails.price) > 0.0001) {
        const pendingData = {
          productName: effectiveDetails.productName,
          customerName: effectiveDetails.customerName,
          requestedPrice: effectiveDetails.price,
          existingPrice,
          showProcess: effectiveDetails.showProcess,
        }
        setPendingPriceConfirmation(pendingData)
        showPriceConfirmationInLive(pendingData)
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: 'agent',
            content: `Ese producto ya tiene un valor en Odoo (${existingPrice.toFixed(2)}). ¿Quieres modificarlo a ${effectiveDetails.price.toFixed(2)}? Responde sí o no.`,
            timestamp: new Date().toISOString(),
          },
        ])
        return
      }
    }

    if (effectiveDetails.showProcess) {
      await startOdooLiveTutorial(true)
    }
    await runOdooE2ELive(sourceText, true, {
      productName: effectiveDetails.productName,
      customerName: effectiveDetails.customerName,
      price: effectiveDetails.price,
      allowPriceUpdateExisting: false,
    })
  }

  const sendMessage = useCallback(async (text?: string) => {
    const plainText = typeof text === 'string' ? text : editor?.getText() || ''
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

    const normalizedInput = plainText.trim()

    if (pendingInvoiceDraft) {
      const details = mergeInvoiceDetails(pendingInvoiceDraft, normalizedInput)
      const missing = getMissingInvoiceField(details)
      if (missing) {
        setPendingInvoiceDraft({ ...details, waitingFor: missing })
        setMessages((m) => [
          ...m,
          {
            id: `a-missing-${Date.now()}`,
            role: 'agent',
            content: invoiceMissingMessage(missing, details),
            timestamp: new Date().toISOString(),
          },
        ])
        setIsTyping(false)
        return
      }
      setPendingInvoiceDraft(null)
      await executeInvoiceWorkflow(details, normalizedInput)
      setIsTyping(false)
      return
    }

    if (pendingExistingPriceDecision) {
      const pending = pendingExistingPriceDecision
      const requestedPrice = extractAmountFromText(normalizedInput)
      if (requestedPrice && Math.abs(requestedPrice - pending.existingPrice) > 0.0001) {
        setPendingExistingPriceDecision(null)
        if (pending.showProcess) {
          await startOdooLiveTutorial(true)
        }
        await runOdooE2ELive(
          `factura producto ${pending.productName} valor ${requestedPrice}`,
          true,
          {
            productName: pending.productName,
            customerName: pending.customerName,
            price: requestedPrice,
            allowPriceUpdateExisting: true,
          },
        )
        setIsTyping(false)
        return
      }

      if (shouldUseExistingPrice(normalizedInput) || (requestedPrice && Math.abs(requestedPrice - pending.existingPrice) <= 0.0001)) {
        setPendingExistingPriceDecision(null)
        if (pending.showProcess) {
          await startOdooLiveTutorial(true)
        }
        await runOdooE2ELive(
          `factura producto ${pending.productName} valor ${pending.existingPrice}`,
          true,
          {
            productName: pending.productName,
            customerName: pending.customerName,
            price: pending.existingPrice,
            allowPriceUpdateExisting: false,
          },
        )
        setIsTyping(false)
        return
      }

      setMessages((m) => [
        ...m,
        {
          id: `a-existing-price-help-${Date.now()}`,
          role: 'agent',
          content: `Escribe "usar" para mantener el precio actual (${pending.existingPrice.toFixed(2)}) o indica el nuevo monto.`,
          timestamp: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
      return
    }

    if (pendingPriceConfirmation) {
      if (isAffirmative(normalizedInput)) {
        const pending = pendingPriceConfirmation
        setPendingPriceConfirmation(null)
        if (pending.showProcess) {
          await startOdooLiveTutorial(true)
        }
        await runOdooE2ELive(
          `factura producto ${pending.productName} valor ${pending.requestedPrice}`,
          true,
          {
            productName: pending.productName,
            customerName: pending.customerName,
            price: pending.requestedPrice,
            allowPriceUpdateExisting: true,
          },
        )
        setIsTyping(false)
        return
      }
      if (isNegative(normalizedInput)) {
        const pending = pendingPriceConfirmation
        setPendingPriceConfirmation(null)
        if (pending.showProcess) {
          await startOdooLiveTutorial(true)
        }
        await runOdooE2ELive(
          `factura producto ${pending.productName} valor ${pending.existingPrice}`,
          true,
          {
            productName: pending.productName,
            customerName: pending.customerName,
            price: pending.existingPrice,
            allowPriceUpdateExisting: false,
          },
        )
        setIsTyping(false)
        return
      }
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'agent',
          content: 'Responde "sí" para actualizar el precio o "no" para mantener el valor actual.',
          timestamp: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
      return
    }

    const intent = inferAutonomousIntent(normalizedInput)
    if (intent === 'invoice_e2e') {
      const details = extractInvoiceIntentData(normalizedInput)
      await executeInvoiceWorkflow(details, normalizedInput)
      setIsTyping(false)
      return
    }

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

      if (error instanceof TimeoutError) {
        errorMsg = `⏱️ ${error.message}. Intenta nuevamente o selecciona un modelo diferente.`
        addToast('Tiempo de espera agotado', 'warning')
      } else if (!isOnline) {
        errorMsg = '🌐 No hay conexión a internet. Por favor, verifica tu red.'
        addToast('Sin conexión', 'error')
      } else if (error instanceof AuthError) {
        errorMsg = `Error de autenticación: ${error.message}`
        addToast('Verifica tu API key', 'error')
      } else if (error instanceof RateLimitError) {
        errorMsg = `Límite de velocidad excedido: Intenta nuevamente en unos segundos`
        addToast('Rate limit alcanzado', 'warning')
      } else if (error instanceof ModelNotFoundError) {
        errorMsg = `Modelo no encontrado: ${error.message}`
        addToast('Modelo no disponible', 'error')
      } else if (error instanceof AllProvidersFailedError) {
        errorMsg = `❌ Todos los servicios no están disponibles. Intenta más tarde o selecciona un modelo diferente.`
        addToast('Servicios no disponibles', 'error')
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
  }, [editor, workflow, setWorkflow, addToast, selectedModel, messages, pendingPriceConfirmation, pendingExistingPriceDecision, pendingInvoiceDraft])

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

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const clampLiveFrame = (x: number, y: number, w: number, h: number) => {
    const hostRect = canvasPortalTarget?.getBoundingClientRect()
    const minX = hostRect ? 8 : 230
    const minY = hostRect ? 8 : 64
    const maxX = hostRect
      ? Math.max(minX, hostRect.width - w - 8)
      : Math.max(minX, window.innerWidth - 360 - w - 12)
    const maxY = hostRect
      ? Math.max(minY, hostRect.height - h - 8)
      : Math.max(minY, window.innerHeight - h - 16)
    return { x: Math.max(minX, Math.min(x, maxX)), y: Math.max(minY, Math.min(y, maxY)) }
  }

  const fitLiveFrameToViewport = useCallback(() => {
    const hostRect = canvasPortalTarget?.getBoundingClientRect()
    if (!hostRect) return

    // Responsive bounds for all screen sizes.
    const maxW = Math.max(620, hostRect.width - 16)
    const maxH = Math.max(420, hostRect.height - 16)
    const minW = Math.min(620, maxW)
    const minH = Math.min(420, maxH)

    setLiveFrameSize((prev) => {
      const nextW = Math.max(minW, Math.min(prev.w, maxW))
      const nextH = Math.max(minH, Math.min(prev.h, maxH))
      const clamped = clampLiveFrame(liveFramePos.x, liveFramePos.y, nextW, nextH)
      setLiveFramePos(clamped)
      return { w: nextW, h: nextH }
    })
  }, [canvasPortalTarget, liveFramePos.x, liveFramePos.y])

  const centerLiveFrame = () => {
    const hostRect = canvasPortalTarget?.getBoundingClientRect()
    const x = hostRect ? Math.max(8, (hostRect.width - liveFrameSize.w) / 2) : 240
    const y = hostRect ? Math.max(8, (hostRect.height - liveFrameSize.h) / 2) : 76
    setLiveFramePos(clampLiveFrame(x, y, liveFrameSize.w, liveFrameSize.h))
  }

  const toggleMaximizeLiveFrame = () => {
    if (!liveFrameMaximized) {
      setLiveFramePrev({ x: liveFramePos.x, y: liveFramePos.y, w: liveFrameSize.w, h: liveFrameSize.h })
      const hostRect = canvasPortalTarget?.getBoundingClientRect()
      const x = hostRect ? 8 : 230
      const y = hostRect ? 8 : 64
      const w = hostRect ? Math.max(620, hostRect.width - 16) : Math.max(620, window.innerWidth - 230 - 360 - 12)
      const h = hostRect ? Math.max(420, hostRect.height - 16) : Math.max(420, window.innerHeight - 64 - 16)
      setLiveFramePos({ x, y })
      setLiveFrameSize({ w, h })
      setLiveFrameMaximized(true)
      return
    }
    if (liveFramePrev) {
      setLiveFramePos({ x: liveFramePrev.x, y: liveFramePrev.y })
      setLiveFrameSize({ w: liveFramePrev.w, h: liveFramePrev.h })
    }
    setLiveFrameMaximized(false)
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        const next = clampLiveFrame(
          e.clientX - dragRef.current.dx,
          e.clientY - dragRef.current.dy,
          liveFrameSize.w,
          liveFrameSize.h,
        )
        setLiveFramePos(next)
      }
      if (resizeRef.current.active) {
        const dw = e.clientX - resizeRef.current.sx
        const dh = e.clientY - resizeRef.current.sy
        const hostRect = canvasPortalTarget?.getBoundingClientRect()
        const maxW = hostRect ? Math.max(620, hostRect.width - 16) : 1300
        const maxH = hostRect ? Math.max(420, hostRect.height - 16) : 820
        const nextW = Math.max(620, Math.min(maxW, resizeRef.current.w + dw))
        const nextH = Math.max(420, Math.min(maxH, resizeRef.current.h + dh))
        const nextPos = clampLiveFrame(liveFramePos.x, liveFramePos.y, nextW, nextH)
        setLiveFramePos(nextPos)
        setLiveFrameSize({ w: nextW, h: nextH })
      }
    }
    const onUp = () => {
      dragRef.current.active = false
      resizeRef.current.active = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [canvasPortalTarget, liveFramePos.x, liveFramePos.y, liveFrameSize.w, liveFrameSize.h])

  useEffect(() => {
    const onResize = () => {
      if (!showOdooLiveIframe) return
      if (liveFrameMaximized) {
        const hostRect = canvasPortalTarget?.getBoundingClientRect()
        if (!hostRect) return
        setLiveFramePos({ x: 8, y: 8 })
        setLiveFrameSize({
          w: Math.max(620, hostRect.width - 16),
          h: Math.max(420, hostRect.height - 16),
        })
        return
      }
      fitLiveFrameToViewport()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [canvasPortalTarget, fitLiveFrameToViewport, liveFrameMaximized, showOdooLiveIframe])

  useEffect(() => {
    if (!showOdooLiveIframe) return
    fitLiveFrameToViewport()
  }, [fitLiveFrameToViewport, showOdooLiveIframe])

  useEffect(() => {
    return () => {
      if (tutorialPollRef.current) {
        window.clearInterval(tutorialPollRef.current)
        tutorialPollRef.current = null
      }
    }
  }, [])

  const extractPriceFromPrompt = (prompt: string): number => {
    const patterns = [
      /valor\s*(?:de|:)?\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /precio\s*(?:de|:)?\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /\$\s*([0-9]+(?:[.,][0-9]+)?)/i,
    ]
    for (const re of patterns) {
      const m = prompt.match(re)
      if (m?.[1]) {
        const n = Number(m[1].replace(',', '.'))
        if (!Number.isNaN(n) && n > 0) return n
      }
    }
    return 229.99
  }

  const upsertLiveNode = (status: 'running' | 'done' | 'error', detail: string) => {
    if (!workflow) return
    const id = 'odoo-live-node'
    const now = new Date().toISOString()
    const existing = (workflow.nodes || []).find((n: any) => n.id === id)
    const data = {
      label: 'Odoo Live Browser',
      iframeSrc: odooLiveIframeSrc,
      currentStep: detail,
      steps: odooLiveSteps,
      isError: status === 'error',
      errorMessage: status === 'error' ? detail : null,
      frameImage: odooLiveFrameSrc,
      onClose: () => {
        if (!workflow) return
        setWorkflow({
          ...workflow,
          nodes: (workflow?.nodes || []).filter((n: any) => n.id !== id),
        } as any)
      },
    }
    if (existing) {
      setWorkflow({
        ...workflow,
        nodes: (workflow.nodes || []).map((n: any) => (n.id === id ? { ...n, data: { ...(n.data || {}), ...data } } : n)),
        updatedAt: now,
      } as any)
      return
    }
    setWorkflow({
      ...workflow,
      nodes: [
        ...(workflow.nodes || []),
        { id, type: 'odoo-live-browser', data, position: { x: 320, y: 200 }, style: { width: 900, height: 520 } },
      ],
      edges: [...(workflow.edges || [])],
      updatedAt: now,
    } as any)
  }

  const showPriceConfirmationInLive = (data: PendingPriceConfirmation) => {
    setShowOdooLiveIframe(true)
    setLiveIframeError(null)
    setOdooLiveCurrentStep('Confirmación requerida')
    setOdooLiveSteps((prev) => [
      ...prev,
      `Producto detectado: ${data.productName}`,
      `Precio en Odoo: ${data.existingPrice.toFixed(2)}`,
      `Precio solicitado: ${data.requestedPrice.toFixed(2)}`,
      'Esperando confirmación del usuario: sí/no',
    ])
    upsertLiveNode(
      'running',
      `Confirmación requerida para ${data.productName}: ${data.existingPrice.toFixed(2)} -> ${data.requestedPrice.toFixed(2)}`,
    )
  }

  const startOdooLiveTutorial = async (fromChat = false) => {
    setShowOdooLiveIframe(true)
    setLiveRenderMode('step-viewer')
    setOdooLiveFrameSrc('')
    setOdooLiveCurrentStep('Iniciando tutorial live en Odoo')
    setOdooLiveSteps(['Iniciando tutorial visual dentro de ORCA...'])
    upsertLiveNode('running', 'Iniciando tutorial visual Odoo')
    try {
      await fetch('/api/orca/odoo-live-tutorial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (tutorialPollRef.current) window.clearInterval(tutorialPollRef.current)
      tutorialPollRef.current = window.setInterval(async () => {
        try {
          const resp = await fetch('/api/orca/odoo-live-tutorial/status')
          const data = await resp.json()
          if (!resp.ok || !data?.ok) return
          if (Array.isArray(data.log_lines) && data.log_lines.length > 0) {
            const mapped = data.log_lines.map((ln: string) => ln.replace(/^\[[^\]]+\]\s*/, ''))
            setOdooLiveSteps(mapped)
            setOdooLiveCurrentStep(data.running ? 'Tutorial en ejecución' : (data.last_error ? 'Error tutorial' : 'Tutorial completado'))
          }
          if (data.latest_frame) {
            const frameSrc = `/api/orca/odoo-live-tutorial/frame/${encodeURIComponent(data.latest_frame)}?t=${Date.now()}`
            setOdooLiveFrameSrc(frameSrc)
          }
          if (!data.running) {
            if (tutorialPollRef.current) {
              window.clearInterval(tutorialPollRef.current)
              tutorialPollRef.current = null
            }
            if (data.last_error) upsertLiveNode('error', data.last_error)
            else upsertLiveNode('done', 'Tutorial Odoo completado')
          }
        } catch {
          // ignore poll errors
        }
      }, 1600)
      if (fromChat) {
        setMessages((m) => [
          ...m,
          {
            id: `a-tutorial-${Date.now()}`,
            role: 'agent',
            content: 'Inicié el tutorial live de Odoo en el canvas de ORCA para que veas el paso a paso.',
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo iniciar tutorial live'
      setOdooLiveSteps((prev) => [...prev, `Error: ${msg}`])
      upsertLiveNode('error', msg)
    }
  }

  const runOdooE2ELive = async (
    promptText?: string,
    fromChat = false,
    options?: { productName?: string; customerName?: string; price?: number; allowPriceUpdateExisting?: boolean },
  ) => {
    if (isRunningOdooE2E) return
    const price = options?.price ?? extractPriceFromPrompt(promptText || '')
    setIsRunningOdooE2E(true)
    setOdooLiveSteps([
      'Iniciando operación Odoo end-to-end...',
      'Nodo live creado: Odoo Invoice Live',
      'Paso 1/6: crear producto',
      'Paso 2/6: crear cliente',
      'Paso 3/6: crear venta',
      'Paso 4/6: crear factura',
      'Paso 5/6: registrar pago',
      'Paso 6/6: generar PDF',
    ])
    setShowOdooLiveIframe(true)
    setLiveIframeError(null)
    setLiveRenderMode('iframe')
    setOdooLiveCurrentStep('Autenticando y preparando entorno')
    await ensureOdooWebSession()
    setOdooLiveIframeSrc(odooWebUrl(`/web?db=${encodeURIComponent(getOdooDb())}`))
    upsertLiveNode('running', 'Ejecutando flujo de factura E2E...')
    if (fromChat) {
      setMessages((m) => [
        ...m,
        {
          id: `a-live-${Date.now()}`,
          role: 'agent',
          content: `Entendido. Detecté cliente "${options?.customerName || 'por confirmar'}", producto "${options?.productName || 'por confirmar'}" y precio ${price.toFixed(2)}. Crearé cliente/producto si no existen en Odoo y lo mostraré en el nodo live.`,
          timestamp: new Date().toISOString(),
        },
      ])
    }
    try {
      const response = await fetch('/api/orca/odoo-e2e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qty: 1,
          price,
          product_name: options?.productName || '',
          customer_name: options?.customerName || '',
          allow_price_update_existing: Boolean(options?.allowPriceUpdateExisting),
        }),
      })
      const data = await response.json()
      if (!response.ok || !data?.ok) {
        throw new Error(data?.detail || data?.stderr || data?.stdout || 'La operación Odoo falló')
      }
      const result = data.result || {}
      // Reproducir el paso a paso dentro del iframe live en ORCA UI.
      if (result?.productId) {
        setOdooLiveCurrentStep('Paso 1/6 · Producto')
        setOdooLiveSteps((prev) => [...prev, `Mostrando producto #${result.productId}`])
        setOdooLiveIframeSrc(odooWebUrl(`/web#id=${result.productId}&model=product.product&view_type=form`))
        await sleep(4200)
      }
      if (result?.partnerId) {
        setOdooLiveCurrentStep('Paso 2/6 · Cliente')
        setOdooLiveSteps((prev) => [...prev, `Mostrando cliente #${result.partnerId}`])
        setOdooLiveIframeSrc(odooWebUrl(`/web#id=${result.partnerId}&model=res.partner&view_type=form`))
        await sleep(4200)
      }
      if (result?.saleOrderId) {
        setOdooLiveCurrentStep('Paso 3/6 · Venta')
        setOdooLiveSteps((prev) => [...prev, `Mostrando venta #${result.saleOrderId}`])
        setOdooLiveIframeSrc(odooWebUrl(`/web#id=${result.saleOrderId}&model=sale.order&view_type=form`))
        await sleep(4600)
      }
      if (result?.invoiceId) {
        setOdooLiveCurrentStep('Paso 4/6 · Factura')
        setOdooLiveSteps((prev) => [...prev, `Mostrando factura #${result.invoiceId}`])
        setOdooLiveIframeSrc(odooWebUrl(`/web#id=${result.invoiceId}&model=account.move&view_type=form`))
        await sleep(4600)
      }
      if (result?.invoiceId) {
        setOdooLiveCurrentStep('Paso 6/6 · PDF descargado')
        setOdooLiveSteps((prev) => [...prev, `PDF de factura #${result.invoiceId} descargado por el workflow`])
        await sleep(2200)
      }
      setOdooLiveCurrentStep('Completado')
      setOdooLiveSteps((prev) => [
        ...prev,
        `Factura: ${result.invoiceName || result.invoiceId || 'N/A'}`,
        `Estado factura: ${result.invoiceState || 'N/A'}`,
        `Estado pago: ${result.paymentState || 'N/A'}`,
        `PDF: ${result.pdfPath || 'N/A'}`,
        'Operación finalizada correctamente.',
      ])
      upsertLiveNode('done', `Factura ${result.invoiceName || result.invoiceId || 'N/A'} pagada`)
      // Save workflow template for future reuse
      if (options?.customerName && options?.productName && price > 0) {
        saveTemplate(options.customerName, options.productName, price)
      }

      if (fromChat) {
        setMessages((m) => [
          ...m,
          {
            id: `a-live-ok-${Date.now()}`,
            role: 'agent',
            content: `Proceso completado. Factura ${result.invoiceName || result.invoiceId}, estado de pago: ${result.paymentState}, PDF: ${result.pdfPath}.`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
      addToast('Odoo E2E completado', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setOdooLiveCurrentStep('Error')
      setOdooLiveSteps((prev) => [...prev, `Error: ${message}`])
      upsertLiveNode('error', message)
      addToast('Odoo E2E falló', 'error')
    } finally {
      setIsRunningOdooE2E(false)
    }
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
    setLocalProjectActivated(true)
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

  const liveFrameImageSrc = odooLiveFrameSrc || (isLiveFrameImage(odooLiveIframeSrc) ? odooLiveIframeSrc : '')

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

        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Odoo Live
          </div>
          <button
            onClick={() => {
              void runOdooE2ELive()
            }}
            disabled={isRunningOdooE2E}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(124, 77, 255, 0.35)',
              backgroundColor: isRunningOdooE2E ? 'rgba(124, 77, 255, 0.15)' : 'rgba(124, 77, 255, 0.08)',
              color: 'var(--stitch-text)',
              cursor: isRunningOdooE2E ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            {isRunningOdooE2E ? 'Ejecutando operación...' : 'Ejecutar factura E2E'}
          </button>
          {odooLiveSteps.length > 0 && (
            <div style={{ marginTop: '8px', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--stitch-border)', borderRadius: '8px', padding: '8px', background: 'var(--stitch-elevated)' }}>
              {odooLiveSteps.map((step, idx) => (
                <div key={`${idx}-${step}`} style={{ fontSize: '11px', color: 'var(--stitch-text)', marginBottom: '6px' }}>
                  {step}
                </div>
              ))}
            </div>
          )}
          {(workflow?.nodes || []).some((n: any) => n.id === 'odoo-live-node') && (
            <div style={{ marginTop: '8px', border: '1px solid rgba(124, 77, 255, 0.35)', borderRadius: '8px', padding: '8px', background: 'rgba(124, 77, 255, 0.08)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--stitch-text)' }}>Nodo Live</div>
              <div style={{ fontSize: '11px', color: 'var(--stitch-muted)' }}>Odoo Invoice Live</div>
            </div>
          )}
          <button
            onClick={() => setShowOdooLiveIframe((v) => !v)}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--stitch-border)',
              background: 'var(--stitch-hover)',
              color: 'var(--stitch-text)',
              cursor: 'pointer',
              fontSize: '11px',
              textAlign: 'left',
            }}
          >
            {showOdooLiveIframe ? 'Ocultar Live Browser' : 'Mostrar Live Browser'}
          </button>
        </div>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && editor?.getText().trim()) {
                  e.preventDefault()
                  sendMessage()
                }
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
                onClick={() => editor?.commands.clearContent()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid var(--stitch-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--stitch-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Limpiar entrada"
              >
                <Trash2 size={14} />
              </button>
            )}

            {!isTyping && (
              <button
                onClick={() => sendMessage()}
                disabled={!editor || !editor.getText().trim() || isTyping || !isOnline}
                title={!isOnline ? 'Sin conexión a internet' : ''}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: editor && editor.getText().trim() && !isTyping && isOnline ? 'var(--stitch-accent)' : 'var(--stitch-hover)',
                  color: editor && editor.getText().trim() && !isTyping && isOnline ? '#fff' : 'var(--stitch-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: editor && editor.getText().trim() && !isTyping && isOnline ? 'pointer' : 'not-allowed',
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

      {showOdooLiveIframe && createPortal(
        <div
          style={{
            position: canvasPortalTarget ? 'absolute' : 'fixed',
            left: `${liveFramePos.x}px`,
            top: `${liveFramePos.y}px`,
            width: `${liveFrameSize.w}px`,
            height: `${liveFrameSize.h}px`,
            borderRadius: '10px',
            border: '1px solid var(--stitch-border)',
            overflow: 'hidden',
            zIndex: 9998,
            boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
            background: '#0b0f17',
          }}
        >
          <div
            style={{
              height: '42px',
              borderBottom: '1px solid var(--stitch-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              color: 'var(--stitch-text)',
              fontSize: '12px',
              cursor: 'move',
            }}
            onMouseDown={(e) => {
              dragRef.current = {
                active: true,
                dx: e.clientX - liveFramePos.x,
                dy: e.clientY - liveFramePos.y,
              }
            }}
          >
            <span>Live Browser · Odoo E2E</span>
            <span style={{ marginLeft: '8px', color: liveIframeError ? '#fca5a5' : '#99A3B3', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {liveIframeError ? `Error: ${liveIframeError}` : `${odooLiveCurrentStep} · ${odooLiveIframeSrc}`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLiveRenderMode((m) => (m === 'iframe' ? 'step-viewer' : 'iframe'))
                }}
                style={{
                  border: '1px solid var(--stitch-border)',
                  background: 'transparent',
                  color: 'var(--stitch-text)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {liveRenderMode === 'iframe' ? 'Ver Pasos' : 'Ver Iframe'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  centerLiveFrame()
                }}
                style={{
                  border: '1px solid var(--stitch-border)',
                  background: 'transparent',
                  color: 'var(--stitch-text)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Centrar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMaximizeLiveFrame()
                }}
                style={{
                  border: '1px solid var(--stitch-border)',
                  background: 'transparent',
                  color: 'var(--stitch-text)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {liveFrameMaximized ? 'Restaurar' : 'Maximizar'}
              </button>
            <button
              onClick={() => setShowOdooLiveIframe(false)}
              style={{
                border: '1px solid var(--stitch-border)',
                background: 'transparent',
                color: 'var(--stitch-text)',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Cerrar
            </button>
            </div>
          </div>
          {liveRenderMode === 'iframe' ? (
            <iframe
              title="odoo-live-browser"
              src={odooLiveIframeSrc}
              key={odooLiveIframeSrc}
              style={{ width: '100%', height: 'calc(100% - 42px)', border: 'none', background: '#fff' }}
              onLoad={() => {
                setLiveIframeError(null)
              }}
              onError={() => {
                setLiveIframeError('No se pudo cargar el Live Browser.')
                setOdooLiveCurrentStep('Error de carga iframe')
                setLiveRenderMode('step-viewer')
              }}
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div style={{ height: 'calc(100% - 42px)', overflow: 'auto', background: '#0f172a', color: '#e5e7eb', padding: '12px' }}>
              <div style={{ fontSize: '12px', marginBottom: '10px', color: '#cbd5e1' }}>
                Vista compatible: Odoo puede bloquear iframe en navegador. Aqui ves el proceso en vivo con los mismos pasos.
              </div>
              {liveFrameImageSrc ? (
                <div style={{ marginBottom: '10px', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden', background: '#020617' }}>
                  <img src={liveFrameImageSrc} alt="Odoo live frame" style={{ width: '100%', display: 'block' }} />
                </div>
              ) : null}
              {odooLiveSteps.map((step, idx) => (
                <div key={`${idx}-${step}`} style={{ fontSize: '12px', lineHeight: 1.45, padding: '6px 8px', border: '1px solid #1e293b', borderRadius: '6px', marginBottom: '8px', background: '#111827' }}>
                  {step}
                </div>
              ))}
              {odooLiveIframeSrc && (
                <a href={odooLiveIframeSrc} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', fontSize: '12px' }}>
                  Abrir paso actual en nueva pestaña
                </a>
              )}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '18px',
              height: '18px',
              cursor: 'nwse-resize',
              background:
                'linear-gradient(135deg, transparent 0 45%, rgba(124,77,255,.55) 45% 60%, transparent 60% 100%)',
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              resizeRef.current = {
                active: true,
                sx: e.clientX,
                sy: e.clientY,
                w: liveFrameSize.w,
                h: liveFrameSize.h,
              }
            }}
          />
        </div>,
        canvasPortalTarget || document.body
      )}
    </div>
  )
}
