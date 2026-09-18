export interface SearchResult {
  id: string
  label: string
  type: 'node' | 'command' | 'history' | 'help'
  description?: string
  color?: string
  category?: string
  icon?: any
  matchScore?: number
  timestamp?: number
  nodeTypeId?: string
}

export interface SearchHistory {
  id: string
  label: string
  timestamp: number
  color?: string
}
