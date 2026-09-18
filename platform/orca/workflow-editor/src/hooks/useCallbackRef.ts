import { useRef, useCallback } from 'react'

export function useCallbackRef<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  // Update the ref whenever the callback changes
  callbackRef.current = callback

  // Return a memoized callback that always uses the current ref
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}
