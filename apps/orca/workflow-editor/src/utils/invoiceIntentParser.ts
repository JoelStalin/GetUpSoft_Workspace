/**
 * Enhanced Invoice Intent Parser
 * Phase 4: Odoo Invoice Workflow UX
 *
 * Features:
 * - Typo-tolerant product/customer name extraction
 * - Product alias resolution with fuzzy matching
 * - Workflow template persistence
 * - Multi-language support (Spanish/English)
 */

export interface InvoiceTemplate {
  id: string
  name: string
  customer: string
  product: string
  price: number
  createdAt: string
  usedCount: number
}

// Expanded product alias library for common typos
export const PRODUCT_ALIASES = [
  { canonical: 'Pepsi', variants: ['pesi', 'pepsi', 'pepsy', 'pepsí', 'pepsee', 'pepcie'] },
  { canonical: 'Coca Cola', variants: ['cocolola', 'cocaola', 'cocacola', 'coka cola', 'coca', 'cocacolla'] },
  { canonical: 'Sprite', variants: ['sprayte', 'spritee', 'esprite', 'sprites', 'sprit'] },
  { canonical: 'Fanta', variants: ['fanta', 'fantá', 'fanter', 'fande'] },
  { canonical: 'Red Bull', variants: ['redbull', 'red bull', 'red bul', 'rdbull'] },
  { canonical: 'Jugo', variants: ['zumo', 'jugo', 'jogo', 'jugo natural'] },
  { canonical: 'Cerveza', variants: ['cervesa', 'cerveza', 'beer', 'birra'] },
  { canonical: 'Café', variants: ['cafe', 'café', 'caffee', 'cafe espresso'] },
  { canonical: 'Agua', variants: ['agua', 'agua mineral', 'agua pura'] },
]

// Common missing field detection patterns
export const MISSING_FIELD_PATTERNS = {
  customer: /(?:cliente|clinte|para quién|para que|a quién|a quien)\s+(?:es|debo|deberia|debería|es para)/i,
  product: /(?:qué producto|que producto|cual producto|cuál producto|de qué|de que|articulo|artículo)/i,
  price: /(?:precio|monto|valor|cuánto|cuanto|cuesta|costi|al valor)/i,
}

// Levenshtein distance implementation for fuzzy matching
export function levenshtein(a: string, b: string): number {
  const aLen = a.length
  const bLen = b.length

  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  const matrix: number[][] = Array.from({ length: bLen + 1 }, () => Array(aLen + 1).fill(0))

  for (let i = 0; i <= aLen; i++) matrix[0][i] = i
  for (let j = 0; j <= bLen; j++) matrix[j][0] = j

  for (let j = 1; j <= bLen; j++) {
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost,
      )
    }
  }

  return matrix[bLen][aLen]
}

// Normalize text for comparison
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Fuzzy match a word against a list of variants
export function fuzzyMatchWord(word: string, variants: string[], threshold = 2): string | null {
  const normalized = normalizeText(word)

  for (const variant of variants) {
    const normalizedVariant = normalizeText(variant)
    if (normalized === normalizedVariant) return variant

    const distance = levenshtein(normalized, normalizedVariant)
    if (distance <= threshold) return variant
  }

  return null
}

// Resolve product name using fuzzy matching against aliases
export function resolveProductName(productName: string): { resolved: string; matched: boolean; notes: string[] } {
  if (!productName) return { resolved: productName, matched: false, notes: [] }

  const notes: string[] = []
  const words = productName.split(/\s+/)
  const resolvedWords: string[] = []

  for (const word of words) {
    let matched = false

    for (const alias of PRODUCT_ALIASES) {
      const match = fuzzyMatchWord(word, alias.variants, 2)
      if (match) {
        resolvedWords.push(alias.canonical)
        if (normalizeText(word) !== normalizeText(alias.canonical)) {
          notes.push(`Producto normalizado: "${word}" → "${alias.canonical}"`)
        }
        matched = true
        break
      }
    }

    if (!matched) {
      resolvedWords.push(word)
    }
  }

  const resolved = resolvedWords.join(' ').replace(/\s+/g, ' ').trim()
  return {
    resolved,
    matched: resolved !== productName,
    notes,
  }
}

// Extract amount with multiple patterns
export function extractAmount(text: string): number | null {
  const patterns = [
    /(?:monto|valor|precio)\s*(?:de|:)?\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
    /(?:de)\s+\$?\s*([0-9]+(?:[.,][0-9]+)?)(?=\s|$|[.,;])/i,
    /(?:por|a)\s*\$?\s*([0-9]+(?:[.,][0-9]+)?)/i,
    /\$\s*([0-9]+(?:[.,][0-9]+)?)/i,
    /^[^a-z]*([0-9]+(?:[.,][0-9]+)?)\s*(?:pesos|soles|dolares|dólares|cop|ars|mxn)?[^a-z]*$/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      const num = Number(match[1].replace(',', '.'))
      if (!Number.isNaN(num) && num > 0) return num
    }
  }

  return null
}

// Workflow template management
const TEMPLATES_STORAGE_KEY = 'orca_invoice_templates'

export function saveTemplate(customer: string, product: string, price: number): InvoiceTemplate {
  const templates = getTemplates()

  // Check if similar template exists
  const existing = templates.find(
    t => normalizeText(t.customer) === normalizeText(customer) &&
         normalizeText(t.product) === normalizeText(product)
  )

  if (existing) {
    existing.usedCount += 1
    existing.createdAt = new Date().toISOString()
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
    return existing
  }

  const newTemplate: InvoiceTemplate = {
    id: `template-${Date.now()}`,
    name: `${customer} - ${product}`,
    customer,
    product,
    price,
    createdAt: new Date().toISOString(),
    usedCount: 1,
  }

  templates.push(newTemplate)
  templates.sort((a, b) => b.usedCount - a.usedCount)

  if (templates.length > 20) {
    templates.pop() // Keep only 20 most recent
  }

  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
  return newTemplate
}

export function getTemplates(): InvoiceTemplate[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getRecentTemplates(limit = 5): InvoiceTemplate[] {
  return getTemplates()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

// Multi-language field validation
export function isMissingFieldQuestion(text: string, fieldType: 'customer' | 'product' | 'price'): boolean {
  const normalized = normalizeText(text)

  const patterns: Record<string, string[]> = {
    customer: ['quien', 'que cliente', 'cual cliente', 'cuál cliente', 'para quien', 'para que', 'para quién'],
    product: ['que producto', 'qué producto', 'cual producto', 'cuál producto', 'articulo', 'artículo', 'item'],
    price: ['precio', 'monto', 'valor', 'cuanto', 'cuánto', 'cuesta', 'costi'],
  }

  return patterns[fieldType].some(pattern => normalized.includes(normalizeText(pattern)))
}
