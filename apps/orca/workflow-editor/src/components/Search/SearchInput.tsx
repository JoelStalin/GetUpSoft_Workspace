import { Search, X } from 'lucide-react'
import { getPlatformShortcut } from '../../hooks/useKeyboardShortcuts.ts'

interface SearchInputProps {
  query: string
  isLoading: boolean
  onQueryChange: (query: string) => void
  onClear: () => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchInput({
  query,
  isLoading,
  onQueryChange,
  onClear,
  placeholder = 'Search nodes...',
  autoFocus = true,
}: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search
        size={16}
        className="absolute left-3"
        style={{ color: 'rgb(var(--color-base-500))' }}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border focus:outline-none focus:border-[rgb(var(--color-primary-400))] focus:ring-1 focus:ring-[rgb(var(--color-primary-400))] transition"
        style={{
          backgroundColor: 'rgb(var(--color-base-200))',
          borderColor: 'rgb(var(--color-base-300))',
          color: 'rgb(var(--color-base-700))',
        }}
      />

      {query ? (
        <button
          onClick={onClear}
          className="absolute right-3 p-1 hover:opacity-75 transition"
          title="Clear search"
        >
          <X size={16} style={{ color: 'rgb(var(--color-base-400))' }} />
        </button>
      ) : (
        <div
          className="absolute right-3 text-xs"
          style={{ color: 'rgb(var(--color-base-500))' }}
        >
          {getPlatformShortcut('K')}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-12">
          <div className="animate-spin w-4 h-4 border-2 border-transparent border-t-[rgb(var(--color-primary-400))] rounded-full" />
        </div>
      )}
    </div>
  )
}

