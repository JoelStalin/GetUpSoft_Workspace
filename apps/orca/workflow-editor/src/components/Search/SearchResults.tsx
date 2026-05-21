import { SearchResult } from '../../types/search'
import { getNodeIcon } from '../../utils/nodeIcons'

interface SearchResultsProps {
  results: SearchResult[]
  selectedIndex: number
  isLoading: boolean
  onSelect: (result: SearchResult) => void
}

export default function SearchResults({
  results,
  selectedIndex,
  isLoading,
  onSelect,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm" style={{ color: 'rgb(var(--color-base-400))' }}>
        Searching...
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-sm" style={{ color: 'rgb(var(--color-base-400))' }}>
          No results found
        </div>
        <div className="text-xs mt-2" style={{ color: 'rgb(var(--color-base-500))' }}>
          Try searching for a different term
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {results.map((result, index) => (
        <SearchResultItem
          key={result.id}
          result={result}
          isSelected={index === selectedIndex}
          onSelect={() => onSelect(result)}
        />
      ))}
    </div>
  )
}

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onSelect: () => void
}

function SearchResultItem({ result, isSelected, onSelect }: SearchResultItemProps) {
  const IconComponent = getNodeIcon(result.icon || result.id)

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left px-4 py-3 border-l-4 transition
        ${
          isSelected
            ? 'border-l-[rgb(var(--color-primary-400))]'
            : 'border-l-transparent hover:border-l-[rgb(var(--color-base-400))]'
        }
      `}
      style={{
        backgroundColor: isSelected
          ? 'rgba(var(--color-primary-400) / 0.1)'
          : 'transparent',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded flex-shrink-0"
          style={{
            backgroundColor: `${result.color}20`,
          }}
        >
          {IconComponent && (
            <IconComponent size={16} style={{ color: result.color }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-medium text-sm truncate"
              style={{
                color: 'rgb(var(--color-base-700))',
              }}
            >
              {result.label}
            </span>
            {result.category && (
              <span
                className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  backgroundColor: `${result.color}20`,
                  color: result.color,
                }}
              >
                {result.category}
              </span>
            )}
          </div>
          {result.description && (
            <div
              className="text-xs truncate mt-0.5"
              style={{
                color: 'rgb(var(--color-base-500))',
              }}
            >
              {result.description}
            </div>
          )}
        </div>

        {/* Match indicator */}
        <div
          className="text-xs flex-shrink-0"
          style={{
            color: 'rgb(var(--color-base-400))',
          }}
        >
          {Math.round(result.matchScore)}%
        </div>
      </div>
    </button>
  )
}

