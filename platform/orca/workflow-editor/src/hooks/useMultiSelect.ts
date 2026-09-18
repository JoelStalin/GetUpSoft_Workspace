import { useState, useCallback, useEffect } from 'react'

export function useMultiSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)

  const select = useCallback((id: string, options: { shift?: boolean; ctrl?: boolean } = {}) => {
    setSelectedIds(prev => {
      const next = new Set(prev)

      if (options.shift && lastSelectedId) {
        // Range select - for now just add both
        next.add(id)
        next.add(lastSelectedId)
      } else if (options.ctrl || options.shift) {
        // Toggle selection
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
      } else {
        // Single select
        next.clear()
        next.add(id)
      }

      return next
    })

    setLastSelectedId(id)
  }, [lastSelectedId])

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
    if (ids.length > 0) {
      setLastSelectedId(ids[ids.length - 1])
    }
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
    if (ids.length > 0) {
      setLastSelectedId(ids[ids.length - 1])
    }
  }, [])

  const clear = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedId(null)
  }, [])

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const has = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const count = selectedIds.size
  const ids = Array.from(selectedIds)

  // Handle Ctrl+A globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // This would need access to all node ids - handled in parent
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    select,
    selectMultiple,
    selectAll,
    clear,
    toggle,
    has,
    count,
    ids,
    selectedIds,
  }
}
