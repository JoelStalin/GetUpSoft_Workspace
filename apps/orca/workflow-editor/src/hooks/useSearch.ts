import { useState, useCallback, useEffect } from 'react'
import { SearchResult } from '../types/search'
import { search, buildSearchIndex } from '../utils/search/searchIndex'
import { addToHistory, getHistory } from '../utils/search/searchHistory'

export interface UseSearchOptions {
  nodeTypes?: Record<string, any>
  debounceMs?: number
}

/**
 * Hook for managing search state and operations
 */
export function useSearch(options: UseSearchOptions = {}) {
  const { nodeTypes = {}, debounceMs = 300 } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [history, setHistory] = useState(getHistory())
  const [isLoading, setIsLoading] = useState(false)
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(nodeTypes))

  // Update search index when node types change
  useEffect(() => {
    setSearchIndex(buildSearchIndex(nodeTypes))
  }, [nodeTypes])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true)
        // Simulate search delay
        requestAnimationFrame(() => {
          const searchResults = search(query, searchIndex)
          setResults(searchResults)
          setSelectedIndex(0)
          setIsLoading(false)
        })
      } else {
        setResults([])
        setSelectedIndex(0)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, searchIndex, debounceMs])

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }, [])

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      addToHistory(query, results.length, result.id)
      setHistory(getHistory())
      return result
    },
    [query, results]
  )

  const handleNavigate = useCallback(
    (direction: 'up' | 'down') => {
      if (results.length === 0) return

      let newIndex = selectedIndex
      if (direction === 'down') {
        newIndex = (selectedIndex + 1) % results.length
      } else {
        newIndex = selectedIndex === 0 ? results.length - 1 : selectedIndex - 1
      }
      setSelectedIndex(newIndex)
    },
    [selectedIndex, results]
  )

  const getSelectedResult = useCallback((): SearchResult | undefined => {
    return results[selectedIndex]
  }, [results, selectedIndex])

  const clearQuery = useCallback(() => {
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }, [])

  const clearHistory = useCallback(() => {
    // Import at module level to avoid require
    import('../utils/search/searchHistory').then(({ clearHistory: clearHistoryUtil }) => {
      clearHistoryUtil()
      setHistory([])
    })
  }, [])

  return {
    // State
    query,
    results,
    isOpen,
    isLoading,
    selectedIndex,
    history,
    selectedResult: getSelectedResult(),

    // Actions
    handleSearch,
    handleOpen,
    handleClose,
    handleSelectResult,
    handleNavigate,
    clearQuery,
    clearHistory,
  }
}
