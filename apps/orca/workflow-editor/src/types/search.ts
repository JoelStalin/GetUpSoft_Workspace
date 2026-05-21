/**
 * Search-related types and interfaces
 */

export interface SearchResult {
  type: 'node' | 'action' | 'help'
  id: string
  label: string
  description?: string
  icon?: string
  color?: string
  category?: string
  matchScore: number
  highlightedLabel?: string
  highlightedDescription?: string
}

export interface SearchHistory {
  query: string
  timestamp: Date
  resultCount: number
  selectedId?: string
}

export interface FavoriteNode {
  nodeTypeId: string
  label: string
  color: string
  addedAt: Date
  usageCount: number
}

export interface RecentNode {
  nodeTypeId: string
  label: string
  color: string
  usedAt: Date
}

export interface SearchIndexEntry {
  id: string
  type: 'node'
  label: string
  description: string
  category: string
  color: string
  icon: string
  searchText: string // lowercased, concatenated for full-text search
}

export interface SearchState {
  query: string
  results: SearchResult[]
  isOpen: boolean
  isLoading: boolean
  selectedResultIndex: number
  history: SearchHistory[]
}
