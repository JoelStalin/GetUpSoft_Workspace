import { SearchResult } from '../../types/search'

export interface NodeType {
  name: string
  description?: string
  category?: string
}

export function buildSearchIndex(nodeTypes: Record<string, NodeType>): SearchResult[] {
  return Object.entries(nodeTypes).map(([key, nodeType]) => ({
    id: key,
    label: nodeType.name,
    type: 'node' as const,
    description: nodeType.description,
    category: nodeType.category,
  }))
}

export function searchIndex(
  index: SearchResult[],
  query: string,
  limit: number = 10
): SearchResult[] {
  if (!query.trim()) return []

  const q = query.toLowerCase()

  return index
    .filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

export function search(
  index: SearchResult[],
  query: string,
  limit: number = 10
): SearchResult[] {
  return searchIndex(index, query, limit)
}
