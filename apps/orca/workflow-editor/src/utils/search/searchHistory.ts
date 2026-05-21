import { SearchHistory, FavoriteNode, RecentNode } from '../types/search'

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'orca_search_history',
  FAVORITES: 'orca_favorite_nodes',
  RECENT: 'orca_recent_nodes',
}

const MAX_HISTORY = 50
const MAX_RECENT = 10

/**
 * Add query to search history
 */
export function addToHistory(
  query: string,
  resultCount: number,
  selectedId?: string
): SearchHistory {
  const history = getHistory()

  const entry: SearchHistory = {
    query,
    timestamp: new Date(),
    resultCount,
    selectedId,
  }

  history.unshift(entry)

  // Keep only recent entries
  const trimmed = history.slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(trimmed))

  return entry
}

/**
 * Get search history
 */
export function getHistory(): SearchHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
    if (!stored) return []

    return JSON.parse(stored).map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    }))
  } catch {
    return []
  }
}

/**
 * Clear search history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
}

/**
 * Add node to favorites
 */
export function addToFavorites(nodeTypeId: string, label: string, color: string): FavoriteNode {
  const favorites = getFavorites()

  // Check if already exists
  const existing = favorites.find((f) => f.nodeTypeId === nodeTypeId)
  if (existing) {
    existing.usageCount++
    existing.addedAt = new Date()
  } else {
    favorites.push({
      nodeTypeId,
      label,
      color,
      addedAt: new Date(),
      usageCount: 1,
    })
  }

  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
  return existing || favorites[favorites.length - 1]
}

/**
 * Remove from favorites
 */
export function removeFromFavorites(nodeTypeId: string): void {
  const favorites = getFavorites().filter((f) => f.nodeTypeId !== nodeTypeId)
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
}

/**
 * Get all favorites
 */
export function getFavorites(): FavoriteNode[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES)
    if (!stored) return []

    return JSON.parse(stored).map((f: any) => ({
      ...f,
      addedAt: new Date(f.addedAt),
    }))
  } catch {
    return []
  }
}

/**
 * Check if node is favorite
 */
export function isFavorite(nodeTypeId: string): boolean {
  return getFavorites().some((f) => f.nodeTypeId === nodeTypeId)
}

/**
 * Add node to recent
 */
export function addToRecent(nodeTypeId: string, label: string, color: string): RecentNode {
  const recent = getRecent()

  // Remove if already exists (to move to top)
  const filtered = recent.filter((r) => r.nodeTypeId !== nodeTypeId)

  const entry: RecentNode = {
    nodeTypeId,
    label,
    color,
    usedAt: new Date(),
  }

  filtered.unshift(entry)

  // Keep only recent
  const trimmed = filtered.slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(trimmed))

  return entry
}

/**
 * Get recent nodes
 */
export function getRecent(): RecentNode[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT)
    if (!stored) return []

    return JSON.parse(stored).map((r: any) => ({
      ...r,
      usedAt: new Date(r.usedAt),
    }))
  } catch {
    return []
  }
}

/**
 * Clear all search data (history, favorites, recent)
 */
export function clearAllSearchData(): void {
  clearHistory()
  localStorage.removeItem(STORAGE_KEYS.FAVORITES)
  localStorage.removeItem(STORAGE_KEYS.RECENT)
}

