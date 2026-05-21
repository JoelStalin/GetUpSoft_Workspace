'use client'

import { useCallback } from 'react'
import { useWorkflowState } from './useWorkflowState'
import { Workflow, WorkflowNode } from '../types/workflow'
import { WORKFLOW_ACTIONS } from '../constants/events'
import { Edge } from '@xyflow/react'

/**
 * Hook providing workflow mutation operations
 * All operations automatically clear redo stack
 */
export function useWorkflowOperations() {
  const { dispatch, workflow, selectedNodeId } = useWorkflowState()

  const setWorkflow = useCallback(
    (newWorkflow: Workflow) => {
      dispatch({ type: WORKFLOW_ACTIONS.SET_WORKFLOW, payload: newWorkflow })
    },
    [dispatch]
  )

  const addNode = useCallback(
    (node: WorkflowNode) => {
      dispatch({ type: WORKFLOW_ACTIONS.ADD_NODE, payload: node })
    },
    [dispatch]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      dispatch({ type: WORKFLOW_ACTIONS.DELETE_NODE, payload: nodeId })
    },
    [dispatch]
  )

  const updateNode = useCallback(
    (nodeId: string, data: any) => {
      dispatch({
        type: WORKFLOW_ACTIONS.UPDATE_NODE,
        payload: { id: nodeId, data },
      })
    },
    [dispatch]
  )

  const selectNode = useCallback(
    (nodeId: string | null) => {
      dispatch({ type: WORKFLOW_ACTIONS.SELECT_NODE, payload: nodeId })
    },
    [dispatch]
  )

  const addEdge = useCallback(
    (edge: Edge) => {
      dispatch({ type: WORKFLOW_ACTIONS.ADD_EDGE, payload: edge })
    },
    [dispatch]
  )

  const deleteEdge = useCallback(
    (edgeId: string) => {
      dispatch({ type: WORKFLOW_ACTIONS.DELETE_EDGE, payload: edgeId })
    },
    [dispatch]
  )

  const setError = useCallback(
    (error: string) => {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error })
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch({ type: WORKFLOW_ACTIONS.CLEAR_ERROR })
  }, [dispatch])

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch({ type: WORKFLOW_ACTIONS.SET_LOADING, payload: loading })
    },
    [dispatch]
  )

  return {
    // Getters
    workflow,
    selectedNodeId,

    // Mutations
    setWorkflow,
    addNode,
    deleteNode,
    updateNode,
    selectNode,
    addEdge,
    deleteEdge,
    setError,
    clearError,
    setLoading,
  }
}

