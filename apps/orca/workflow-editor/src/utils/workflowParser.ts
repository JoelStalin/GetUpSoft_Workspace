/**
 * Workflow Parser - Converts natural language chat messages to workflow intent
 * Parses user descriptions and extracts workflow node requirements
 */

export type NodeType = 'trigger' | 'action' | 'condition' | 'output'
export type WorkflowIntentType = 'create' | 'modify' | 'delete' | 'execute' | 'none'

export interface NodeProposal {
  label: string
  type: NodeType
  properties?: Record<string, any>
}

export interface EdgeProposal {
  sourceIndex: number
  targetIndex: number
}

export interface WorkflowIntent {
  type: WorkflowIntentType
  description: string
  nodes: NodeProposal[]
  edges: EdgeProposal[]
  confidence: number
}

/**
 * Node type keywords mapping
 * Maps user descriptions to standard workflow node types
 */
const TRIGGER_KEYWORDS = {
  email: ['email', 'correo', 'inbox', 'mensaje'],
  webhook: ['webhook', 'http', 'request', 'api call'],
  schedule: ['schedule', 'timer', 'every', 'cron', 'periodico'],
  database: ['database', 'sql', 'query', 'db', 'table'],
  file: ['file', 'documento', 'csv', 'json', 'upload'],
}

const ACTION_KEYWORDS = {
  send: ['send', 'enviar', 'smtp', 'email notification', 'notificar'],
  process: ['process', 'procesar', 'transform', 'transformar', 'convert'],
  save: ['save', 'guardar', 'store', 'almacenar', 'write'],
  filter: ['filter', 'filtrar', 'check', 'validate', 'validar'],
  merge: ['merge', 'combine', 'join', 'unir'],
  parse: ['parse', 'extract', 'extraer', 'read', 'leer'],
}

const CONDITION_KEYWORDS = {
  if: ['if', 'si', 'when', 'cuando', 'check'],
  switch: ['switch', 'case', 'select', 'choose'],
  loop: ['loop', 'for each', 'for', 'iterate'],
}

const OUTPUT_KEYWORDS = {
  log: ['log', 'print', 'output', 'mostrar', 'display'],
  export: ['export', 'download', 'save as', 'exportar'],
  notify: ['notify', 'alert', 'warn', 'mensaje'],
}

/**
 * Detects if message contains workflow creation intent
 */
function detectWorkflowIntent(message: string): WorkflowIntentType {
  const lower = message.toLowerCase()

  if (
    lower.includes('create') ||
    lower.includes('crea') ||
    lower.includes('build') ||
    lower.includes('construir') ||
    lower.includes('workflow') ||
    lower.includes('automation')
  ) {
    return 'create'
  }

  if (lower.includes('delete') || lower.includes('elimina')) {
    return 'delete'
  }

  if (lower.includes('modify') || lower.includes('modifica') || lower.includes('change')) {
    return 'modify'
  }

  if (lower.includes('execute') || lower.includes('ejecuta') || lower.includes('run')) {
    return 'execute'
  }

  return 'none'
}

/**
 * Matches keywords and returns node type
 */
function matchKeywords(text: string, keywordMap: Record<string, string[]>): string | null {
  const lower = text.toLowerCase()

  for (const [nodeType, keywords] of Object.entries(keywordMap)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return nodeType
      }
    }
  }

  return null
}

/**
 * Extracts potential nodes from text
 */
function extractNodes(message: string): NodeProposal[] {
  const nodes: NodeProposal[] = []
  const words = message.toLowerCase().split(/\s+/)

  // Group words into meaningful chunks
  const chunks: string[] = []
  let currentChunk = ''

  for (const word of words) {
    currentChunk += (currentChunk ? ' ' : '') + word

    // Check if chunk matches any keyword
    const trigger = matchKeywords(currentChunk, TRIGGER_KEYWORDS)
    const action = matchKeywords(currentChunk, ACTION_KEYWORDS)
    const condition = matchKeywords(currentChunk, CONDITION_KEYWORDS)
    const output = matchKeywords(currentChunk, OUTPUT_KEYWORDS)

    if (trigger || action || condition || output) {
      if (trigger) {
        nodes.push({
          label: formatNodeLabel(trigger, 'trigger'),
          type: 'trigger',
        })
      } else if (action) {
        nodes.push({
          label: formatNodeLabel(action, 'action'),
          type: 'action',
        })
      } else if (condition) {
        nodes.push({
          label: formatNodeLabel(condition, 'condition'),
          type: 'condition',
        })
      } else if (output) {
        nodes.push({
          label: formatNodeLabel(output, 'output'),
          type: 'output',
        })
      }

      currentChunk = ''
    }
  }

  // Remove duplicates while preserving order
  const seen = new Set<string>()
  return nodes.filter((node) => {
    if (seen.has(node.label)) return false
    seen.add(node.label)
    return true
  })
}

/**
 * Formats node label from matched keyword
 */
function formatNodeLabel(keyword: string, type: NodeType): string {
  const labelMap: Record<string, string> = {
    // Triggers
    email: 'Email Trigger',
    webhook: 'Webhook',
    schedule: 'Schedule',
    database: 'Database Query',
    file: 'File Upload',

    // Actions
    send: 'Send Email',
    process: 'Process Data',
    save: 'Save Data',
    filter: 'Filter Data',
    merge: 'Merge Data',
    parse: 'Parse Data',

    // Conditions
    if: 'If Condition',
    switch: 'Switch',
    loop: 'Loop',

    // Outputs
    log: 'Log Output',
    export: 'Export Data',
    notify: 'Notify User',
  }

  return labelMap[keyword] || keyword.toUpperCase()
}

/**
 * Creates connections between nodes
 * Assumes linear workflow: each node connects to the next
 */
function createEdges(nodeCount: number): EdgeProposal[] {
  const edges: EdgeProposal[] = []

  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      sourceIndex: i,
      targetIndex: i + 1,
    })
  }

  return edges
}

/**
 * Main parser function
 * Converts a chat message into a structured workflow intent
 */
export function parseWorkflow(message: string): WorkflowIntent {
  const type = detectWorkflowIntent(message)

  if (type === 'none') {
    return {
      type: 'none',
      description: message,
      nodes: [],
      edges: [],
      confidence: 0,
    }
  }

  const nodes = extractNodes(message)
  const edges = nodes.length > 1 ? createEdges(nodes.length) : []

  // Confidence based on number of nodes and message length
  const baseConfidence = nodes.length > 0 ? 0.7 : 0.3
  const lengthBonus = Math.min(message.length / 100, 0.3)
  const confidence = Math.min(baseConfidence + lengthBonus, 1)

  return {
    type,
    description: message,
    nodes,
    edges,
    confidence,
  }
}

/**
 * Validates if the parsed workflow makes sense
 */
export function validateWorkflow(intent: WorkflowIntent): { valid: boolean; reason?: string } {
  if (intent.type === 'none') {
    return { valid: false, reason: 'No workflow intent detected' }
  }

  if (intent.nodes.length === 0) {
    return { valid: false, reason: 'No workflow nodes found' }
  }

  if (intent.nodes.length > 20) {
    return { valid: false, reason: 'Too many nodes (max 20)' }
  }

  // Check for proper node sequence
  const hasTrigger = intent.nodes.some((n) => n.type === 'trigger')
  const hasAction = intent.nodes.some((n) => n.type === 'action' || n.type === 'output')

  if (!hasTrigger && intent.nodes.length > 0) {
    return { valid: false, reason: 'Workflow should start with a trigger' }
  }

  if (!hasAction && intent.nodes.length > 1) {
    return { valid: false, reason: 'Workflow should have at least one action' }
  }

  return { valid: true }
}

/**
 * Gets a user-friendly description of the parsed workflow
 */
export function describeWorkflow(intent: WorkflowIntent): string {
  if (intent.nodes.length === 0) {
    return 'No workflow detected in your message.'
  }

  const nodeLabels = intent.nodes.map((n) => n.label).join(' → ')
  return `Found workflow with ${intent.nodes.length} nodes: ${nodeLabels}`
}
