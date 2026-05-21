'use client'

import { useCallback } from 'react'
import { useWorkflowState } from './useWorkflowState'
import { WORKFLOW_ACTIONS } from '../constants/events'

/**
 * Hook providing undo/redo functionality
 * Use pushHistory before making changes to snapshot workflow
 */
export function useWorkflowHistory() {
  const { history, future, dispatch } = useWorkflowState()

  const pushHistory = useCallback(() => {
    dispatch({ type: WORKFLOW_ACTIONS.PUSH_HISTORY })
  }, [dispatch])

  const undo = useCallback(() => {
    dispatch({ type: WORKFLOW_ACTIONS.UNDO })
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch({ type: WORKFLOW_ACTIONS.REDO })
  }, [dispatch])

  return {
    // State
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    historySize: history.length,
    futureSize: future.length,

    // Operations
    pushHistory,
    undo,
    redo,
  }
}
