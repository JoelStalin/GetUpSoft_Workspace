'use client'

import { useContext } from 'react'
import { WorkflowContext } from '../contexts/WorkflowContext'

/**
 * Hook to access workflow state and dispatch
 * Must be used within WorkflowProvider
 */
export function useWorkflowState() {
  const context = useContext(WorkflowContext)

  if (!context) {
    throw new Error('useWorkflowState must be used within WorkflowProvider')
  }

  return context
}

