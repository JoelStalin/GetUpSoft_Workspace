import { SearchResult } from '../../types/search'

const STORAGE_KEY = 'orca_search_history'
const MAX_HISTORY = 20

export function addToRecent(id: string, label: string, color: string = '#7c4dff') {
  const history = getHistory()
  const existing = history.findIndex(h => h.id === id)

  if (existing !== -1) {
    history.splice(existing, 1)
  }

  history.unshift({ id, label, color, timestamp: Date.now(), type: 'history' })
  history.splice(MAX_HISTORY)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getHistory(): SearchResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

export function addToHistory(result: SearchResult) {
  const history = getHistory()
  const existing = history.findIndex(h => h.id === result.id)

  if (existing !== -1) {
    history.splice(existing, 1)
  }

  history.unshift(result)
  history.splice(MAX_HISTORY)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getFavorites(): SearchResult[] {
  return getHistory()
}
