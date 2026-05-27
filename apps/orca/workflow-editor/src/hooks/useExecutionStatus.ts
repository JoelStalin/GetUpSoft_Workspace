'use client'

import { useContext, useCallback } from 'react'
import { ExecutionContext } from '../contexts/ExecutionContext'
import { ExecutionLog } from '../types/execution'
import { EXECUTION_ACTIONS } from '../constants/events'

/**
 * Hook for managing execution logs and status
 * Must be used within ExecutionProvider
 */
export function useExecutionStatus() {
  const context = useContext(ExecutionContext)

  if (!context) {
    throw new Error('useExecutionStatus must be used within ExecutionProvider')
  }

  const { state, dispatch } = context
  const { logs, isRunning: isExecuting, executionId: currentExecutionId } = state

  const addLog = useCallback(
    (log: ExecutionLog) => {
      dispatch({ type: EXECUTION_ACTIONS.ADD_LOG, payload: log })
    },
    [dispatch]
  )

  const updateLog = useCallback(
    (nodeId: string, update: Partial<ExecutionLog>) => {
      dispatch({
        type: EXECUTION_ACTIONS.UPDATE_LOG,
        payload: { nodeId, update },
      })
    },
    [dispatch]
  )

  const setLogs = useCallback(
    (newLogs: ExecutionLog[]) => {
      dispatch({ type: EXECUTION_ACTIONS.SET_LOGS, payload: newLogs })
    },
    [dispatch]
  )

  const clearLogs = useCallback(() => {
    dispatch({ type: EXECUTION_ACTIONS.CLEAR_LOGS })
  }, [dispatch])

  const setCurrentExecution = useCallback(
    (executionId: string | null) => {
      dispatch({ type: EXECUTION_ACTIONS.SET_CURRENT_EXECUTION, payload: executionId })
    },
    [dispatch]
  )

  const setIsExecuting = useCallback(
    (executing: boolean) => {
      dispatch({ type: EXECUTION_ACTIONS.SET_IS_EXECUTING, payload: executing })
    },
    [dispatch]
  )

  // Helper to get log for a specific node
  const getNodeLog = useCallback(
    (nodeId: string) => {
      return logs.find((log) => log.nodeId === nodeId || log.node_id === nodeId)
    },
    [logs]
  )

  return {
    // State
    logs,
    isExecuting,
    currentExecutionId,

    // Operations
    addLog,
    updateLog,
    setLogs,
    clearLogs,
    setCurrentExecution,
    setIsExecuting,

    // Helpers
    getNodeLog,
  }
}

