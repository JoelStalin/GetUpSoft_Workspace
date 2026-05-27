'use client'

import { useWorkflowContext } from '../contexts/WorkflowContext'

/**
 * Hook providing undo/redo functionality
 * Exposes undo/redo from context value which are pre-bound and checked
 */
export function useWorkflowHistory() {
  const { history, future, undo, redo, state } = useWorkflowContext()

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < history.length - 1

  return {
    // State
    canUndo,
    canRedo,
    historySize: history.length,
    futureSize: future.length,

    // Operations
    undo,
    redo,
  }
}
