'use client'

import { createContext, useReducer, ReactNode } from 'react'
import { ExecutionLog } from '../types/execution'
import { EXECUTION_ACTIONS } from '../constants/events'

/**
 * Execution State
 */
export interface ExecutionState {
  logs: ExecutionLog[]
  isExecuting: boolean
  currentExecutionId: string | null
  error: string | null
}

/**
 * Execution Context Type
 */
export interface ExecutionContextType extends ExecutionState {
  dispatch: (action: ExecutionAction) => void
}

/**
 * Execution Action Types
 */
export type ExecutionAction =
  | { type: 'SET_LOGS'; payload: ExecutionLog[] }
  | { type: 'ADD_LOG'; payload: ExecutionLog }
  | { type: 'UPDATE_LOG'; payload: { nodeId: string; update: Partial<ExecutionLog> } }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_CURRENT_EXECUTION'; payload: string | null }
  | { type: 'SET_IS_EXECUTING'; payload: boolean }

/**
 * Initial state
 */
const initialState: ExecutionState = {
  logs: [],
  isExecuting: false,
  currentExecutionId: null,
  error: null,
}

/**
 * Create Execution Context
 */
export const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined)

/**
 * Reducer function
 */
function executionReducer(state: ExecutionState, action: ExecutionAction): ExecutionState {
  switch (action.type) {
    case EXECUTION_ACTIONS.SET_LOGS:
      return {
        ...state,
        logs: action.payload,
      }

    case EXECUTION_ACTIONS.ADD_LOG:
      return {
        ...state,
        logs: [...state.logs, action.payload],
      }

    case EXECUTION_ACTIONS.UPDATE_LOG: {
      const { nodeId, update } = action.payload
      return {
        ...state,
        logs: state.logs.map((log) =>
          log.nodeId === nodeId ? { ...log, ...update } : log
        ),
      }
    }

    case EXECUTION_ACTIONS.CLEAR_LOGS:
      return {
        ...state,
        logs: [],
      }

    case EXECUTION_ACTIONS.SET_CURRENT_EXECUTION:
      return {
        ...state,
        currentExecutionId: action.payload,
      }

    case EXECUTION_ACTIONS.SET_IS_EXECUTING:
      return {
        ...state,
        isExecuting: action.payload,
      }

    default:
      return state
  }
}

/**
 * Execution Provider Component
 */
export interface ExecutionProviderProps {
  children: ReactNode
  initialLogs?: ExecutionLog[]
}

export function ExecutionProvider({ children, initialLogs }: ExecutionProviderProps) {
  const [state, dispatch] = useReducer(
    executionReducer,
    initialLogs
      ? {
          ...initialState,
          logs: initialLogs,
        }
      : initialState
  )

  const value: ExecutionContextType = {
    ...state,
    dispatch,
  }

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  )
}

