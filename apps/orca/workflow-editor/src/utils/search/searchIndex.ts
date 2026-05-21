import { SearchResult, SearchIndexEntry } from '../types/search'

/**
 * Build search index from node types
 */
export function buildSearchIndex(nodeTypes: Record<string, any>): SearchIndexEntry[] {
  return Object.entries(nodeTypes).map(([id, nodeInfo]: [string, any]) => ({
    id,
    type: 'node',
    label: nodeInfo.label || id,
    description: nodeInfo.description || '',
    category: nodeInfo.category || categorizeNode(id),
    color: nodeInfo.color || '#7c4dff',
    icon: nodeInfo.icon || 'component',
    searchText: `${nodeInfo.label || id} ${nodeInfo.description || ''}`.toLowerCase(),
  }))
}

/**
 * Categorize node by type
 */
function categorizeNode(nodeTypeId: string): string {
  if (nodeTypeId.includes('trigger')) return 'Triggers'
  if (nodeTypeId.includes('aiPrompt') || nodeTypeId.includes('ai')) return 'AI'
  if (nodeTypeId.includes('http')) return 'Network'
  if (nodeTypeId.includes('condition') || nodeTypeId.includes('loop')) return 'Control Flow'
  return 'Utils'
}

/**
 * Simple fuzzy search implementation
 * Matches characters in order, calculates score based on match quality
 */
function fuzzyMatch(query: string, text: string): { matched: boolean; score: number } {
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (!q) return { matched: true, score: 0 }
  if (q === t) return { matched: true, score: 100 }
  if (t.includes(q)) return { matched: true, score: 80 }

  let score = 0
  let qIdx = 0

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 1
      qIdx++
    }
  }

  if (qIdx === q.length) {
    return { matched: true, score: Math.round((score / q.length) * 60) }
  }

  return { matched: false, score: 0 }
}

/**
 * Search across index
 */
export function search(query: string, index: SearchIndexEntry[]): SearchResult[] {
  if (!query.trim()) return []

  const results = index
    .map((entry) => {
      const labelMatch = fuzzyMatch(query, entry.label)
      const descriptionMatch = fuzzyMatch(query, entry.description)

      const matchScore = Math.max(labelMatch.score, descriptionMatch.score)

      return {
        type: 'node' as const,
        id: entry.id,
        label: entry.label,
        description: entry.description,
        icon: entry.icon,
        color: entry.color,
        category: entry.category,
        matchScore,
        highlightedLabel: highlightMatch(entry.label, query),
        highlightedDescription: highlightMatch(entry.description, query),
      }
    })
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => {
      // Sort by match score first
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      // Then by label length (shorter is better for prefix matches)
      return a.label.length - b.label.length
    })

  return results
}

/**
 * Highlight matching part of text
 */
function highlightMatch(text: string, query: string): string {
  if (!query.trim() || !text) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Calculate match percentage
 */
export function calculateMatchPercentage(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (!q) return 0
  if (q === t) return 100
  if (t.includes(q)) return 80

  const match = fuzzyMatch(q, t)
  return match.matched ? Math.max(20, match.score) : 0
}

/**
 * Get suggestions based on partial query
 */
export function getSuggestions(query: string, index: SearchIndexEntry[], limit = 5): SearchResult[] {
  const results = search(query, index)
  return results.slice(0, limit)
}

