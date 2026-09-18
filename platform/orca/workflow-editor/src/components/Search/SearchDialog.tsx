import { useEffect } from 'react'
import { Clock, Star, Trash2 } from 'lucide-react'
import { SearchResult } from '../../types/search'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import { getFavorites } from '../../utils/search/searchHistory'

interface SearchDialogProps {
  isOpen: boolean
  query: string
  results: SearchResult[]
  selectedIndex: number
  isLoading: boolean
  history: any[]
  onQueryChange: (query: string) => void
  onClearQuery: () => void
  onSelectResult: (result: SearchResult) => void
  onClose: () => void
  onNavigate: (direction: 'up' | 'down') => void
  onClearHistory: () => void
}

export default function SearchDialog({
  isOpen,
  query,
  results,
  selectedIndex,
  isLoading,
  history,
  onQueryChange,
  onClearQuery,
  onSelectResult,
  onClose,
  onNavigate,
  onClearHistory,
}: SearchDialogProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        onNavigate('down')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onNavigate('up')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = results[selectedIndex]
        if (selected) {
          onSelectResult(selected)
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, results, onNavigate, onSelectResult, onClose])

  if (!isOpen) return null

  // Show history/suggestions when query is empty
  const showSuggestions = !query.trim()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: 9995 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 animate-in fade-in scale-in" style={{ zIndex: 9996 }}>
        <div
          className="rounded-lg shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: 'rgb(var(--color-base-200))',
            borderColor: 'rgb(var(--color-base-300))',
          }}
        >
          {/* Search Input */}
          <div className="p-4 border-b" style={{ borderColor: 'rgb(var(--color-base-300))' }}>
            <SearchInput
              query={query}
              isLoading={isLoading}
              onQueryChange={onQueryChange}
              onClear={onClearQuery}
              autoFocus
            />
          </div>

          {/* Results or Suggestions */}
          {showSuggestions ? (
            <Suggestions
              history={history}
              onSelectResult={(result) => {
                onSelectResult(result)
                onClose()
              }}
              onClearHistory={onClearHistory}
            />
          ) : (
            <SearchResults
              results={results}
              selectedIndex={selectedIndex}
              isLoading={isLoading}
              onSelect={(result) => {
                onSelectResult(result)
                onClose()
              }}
            />
          )}

          {/* Footer Help */}
          <div
            className="px-4 py-3 text-xs flex items-center justify-between"
            style={{ backgroundColor: 'rgb(var(--color-base-300))', color: 'rgb(var(--color-base-500))' }}
          >
            <div className="space-x-4">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-in,
          .fade-in {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}

interface SuggestionsProps {
  history: any[]
  onSelectResult: (result: SearchResult) => void
  onClearHistory: () => void
}

function Suggestions({ history, onSelectResult, onClearHistory }: SuggestionsProps) {
  const favorites = getFavorites()

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Recent Searches */}
      {history.length > 0 && (
        <div className="border-b" style={{ borderColor: 'rgb(var(--color-base-300))' }}>
          <div
            className="px-4 py-2 text-xs font-semibold flex items-center gap-2 sticky top-0"
            style={{
              color: 'rgb(var(--color-base-500))',
              backgroundColor: 'rgb(var(--color-base-300))',
            }}
          >
            <Clock size={14} />
            Recent Searches
          </div>
          <div className="p-2">
            {history.slice(0, 5).map((item, i) => (
              <button
                key={i}
                onClick={() =>
                  onSelectResult({
                    type: 'help',
                    id: `history-${i}`,
                    label: item.query,
                    description: `${item.resultCount} results`,
                    matchScore: 50,
                  })
                }
                className="w-full text-left px-3 py-2 rounded text-sm hover:opacity-75 transition"
                style={{
                  color: 'rgb(var(--color-base-600))',
                }}
              >
                {item.query}
              </button>
            ))}
            <button
              onClick={onClearHistory}
              className="w-full text-left px-3 py-2 rounded text-xs flex items-center gap-2 hover:opacity-75 transition mt-2"
              style={{
                color: 'rgb(var(--color-base-500))',
              }}
            >
              <Trash2 size={12} />
              Clear history
            </button>
          </div>
        </div>
      )}

      {/* Favorite Nodes */}
      {favorites.length > 0 && (
        <div>
          <div
            className="px-4 py-2 text-xs font-semibold flex items-center gap-2 sticky top-0"
            style={{
              color: 'rgb(var(--color-base-500))',
              backgroundColor: 'rgb(var(--color-base-300))',
            }}
          >
            <Star size={14} />
            Favorite Nodes
          </div>
          <div className="p-2">
            {favorites.slice(0, 5).map((fav) => (
              <button
                key={fav.nodeTypeId}
                onClick={() =>
                  onSelectResult({
                    type: 'node',
                    id: fav.nodeTypeId,
                    label: fav.label,
                    color: fav.color,
                    matchScore: 75,
                  })
                }
                className="w-full text-left px-3 py-2 rounded text-sm hover:opacity-75 transition"
                style={{
                  color: 'rgb(var(--color-base-600))',
                }}
              >
                {fav.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 && favorites.length === 0 && (
        <div className="p-8 text-center">
          <div
            className="text-sm"
            style={{ color: 'rgb(var(--color-base-500))' }}
          >
            Start typing to search nodes
          </div>
        </div>
      )}
    </div>
  )
}

