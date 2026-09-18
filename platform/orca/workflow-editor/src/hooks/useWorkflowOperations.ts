import { useCallback } from 'react'
import { useWorkflowContext } from '../contexts/WorkflowContext'
import { useExecutionContext } from '../contexts/ExecutionContext'
import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow'
import { ExecutionEvent, ExecutionLog } from '../types/execution'

/**
 * Hook for workflow state access
 */
export function useWorkflowState() {
  const { state } = useWorkflowContext()
  return state
}

/**
 * Hook for workflow operations with dispatch wrappers
 */
export function useWorkflowOperations() {
  const { state, dispatch } = useWorkflowContext()

  const setWorkflow = useCallback(
    (workflow: Workflow) => {
      dispatch({ type: 'SET_WORKFLOW', payload: workflow })
    },
    [dispatch]
  )

  const updateNodes = useCallback(
    (nodes: readonly WorkflowNode[]) => {
      dispatch({ type: 'UPDATE_NODES', payload: nodes })
    },
    [dispatch]
  )

  const updateNode = useCallback(
    (node: WorkflowNode) => {
      if (state.workflow) {
        const updatedNodes = state.workflow.nodes.map((n) => (n.id === node.id ? node : n))
        dispatch({ type: 'UPDATE_NODES', payload: updatedNodes })
      }
    },
    [dispatch, state.workflow]
  )

  const updateEdges = useCallback(
    (edges: readonly WorkflowEdge[]) => {
      dispatch({ type: 'UPDATE_EDGES', payload: edges })
    },
    [dispatch]
  )

  const addNode = useCallback(
    (node: WorkflowNode) => {
      dispatch({ type: 'ADD_NODE', payload: node })
    },
    [dispatch]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      dispatch({ type: 'DELETE_NODE', payload: nodeId })
    },
    [dispatch]
  )

  const addEdge = useCallback(
    (edge: WorkflowEdge) => {
      dispatch({ type: 'ADD_EDGE', payload: edge })
    },
    [dispatch]
  )

  const deleteEdge = useCallback(
    (edgeId: string) => {
      dispatch({ type: 'DELETE_EDGE', payload: edgeId })
    },
    [dispatch]
  )

  const selectNode = useCallback(
    (nodeId: string | null) => {
      dispatch({ type: 'SELECT_NODE', payload: nodeId })
    },
    [dispatch]
  )

  const selectEdge = useCallback(
    (edgeId: string | null) => {
      dispatch({ type: 'SELECT_EDGE', payload: edgeId })
    },
    [dispatch]
  )

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    },
    [dispatch]
  )

  const setError = useCallback(
    (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    },
    [dispatch]
  )

  const markDirty = useCallback(() => {
    dispatch({ type: 'MARK_DIRTY' })
  }, [dispatch])

  const markClean = useCallback(() => {
    dispatch({ type: 'MARK_CLEAN' })
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  const pushHistory = useCallback(
    (workflow: Workflow) => {
      dispatch({ type: 'PUSH_HISTORY', payload: workflow })
    },
    [dispatch]
  )

  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
      dispatch({ type: 'UNDO' })
    }
  }, [state.historyIndex, dispatch])

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      dispatch({ type: 'REDO' })
    }
  }, [state.history.length, state.historyIndex, dispatch])

  return {
    state,
    ...state,
    setWorkflow,
    updateNodes,
    updateNode,
    updateEdges,
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
    selectNode,
    selectEdge,
    setLoading,
    setError,
    markDirty,
    markClean,
    reset,
    pushHistory,
    undo,
    redo,
  }
}

/**
 * Hook for workflow history (undo/redo)
 */
export function useWorkflowHistory() {
  const { state, dispatch } = useWorkflowContext()

  const pushHistory = useCallback(
    (workflow: Workflow) => {
      dispatch({ type: 'PUSH_HISTORY', payload: workflow })
    },
    [dispatch]
  )

  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
      dispatch({ type: 'UNDO' })
    }
  }, [state.historyIndex, dispatch])

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      dispatch({ type: 'REDO' })
    }
  }, [state.history.length, state.historyIndex, dispatch])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  return {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex: state.historyIndex,
    historyLength: state.history.length,
  }
}

/**
 * Hook for execution status access
 */
export function useExecutionStatus() {
  const { state } = useExecutionContext()
  return state
}

/**
 * Hook for execution operations with dispatch wrappers
 */
export function useExecutionOperations() {
  const { state, dispatch } = useExecutionContext()

  const startExecution = useCallback(
    (executionId: string, workflowId: string) => {
      dispatch({
        type: 'START_EXECUTION',
        payload: { executionId, workflowId },
      })
    },
    [dispatch]
  )

  const addEvent = useCallback(
    (event: ExecutionEvent) => {
      dispatch({ type: 'ADD_EVENT', payload: event })
    },
    [dispatch]
  )

  const addLog = useCallback(
    (log: ExecutionLog) => {
      dispatch({ type: 'ADD_LOG', payload: log })
    },
    [dispatch]
  )

  const updateNodeStatus = useCallback(
    (nodeId: string, status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped') => {
      dispatch({ type: 'UPDATE_NODE_STATUS', payload: { nodeId, status } })
    },
    [dispatch]
  )

  const setCurrentNode = useCallback(
    (nodeId: string | null) => {
      dispatch({ type: 'SET_CURRENT_NODE', payload: nodeId })
    },
    [dispatch]
  )

  const updateProgress = useCallback(
    (progress: number) => {
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress })
    },
    [dispatch]
  )

  const completeExecution = useCallback(
    (status: 'completed' | 'failed' | 'cancelled') => {
      if (status === 'failed') {
        dispatch({ type: 'EXECUTION_FAILED', payload: 'Execution failed' })
      } else if (status === 'cancelled') {
        dispatch({ type: 'EXECUTION_CANCELLED' })
      } else {
        // For 'completed' status, we'd need an ExecutionSummary
        // For now, just dispatch EXECUTION_COMPLETE with minimal summary
        dispatch({
          type: 'EXECUTION_COMPLETE',
          payload: {
            id: '',
            workflowId: '',
            status: 'completed',
            startTime: new Date().toISOString(),
            totalNodes: 0,
            completedNodes: 0,
            failedNodes: 0,
            skippedNodes: 0,
            logs: [],
          },
        })
      }
    },
    [dispatch]
  )

  const resetExecution = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  return {
    state,
    startExecution,
    addEvent,
    addLog,
    updateNodeStatus,
    setCurrentNode,
    updateProgress,
    completeExecution,
    resetExecution,
    isRunning: state.status === 'running',
    progress: state.progress,
  }
}
