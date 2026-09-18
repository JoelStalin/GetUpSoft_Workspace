import React, { createContext, useReducer } from 'react'
import { ExecutionEvent, ExecutionLog, ExecutionStatus, ExecutionSummary } from '../types/execution'

/**
 * Execution state for context
 */
export interface ExecutionContextState {
  executionId: string | null
  workflowId: string | null
  status: ExecutionStatus
  currentNodeId: string | null
  events: readonly ExecutionEvent[]
  logs: readonly ExecutionLog[]
  summary: ExecutionSummary | null
  isRunning: boolean
  error: string | null
  progress: number
}

/**
 * Execution context actions
 */
export type ExecutionAction =
  | { type: 'START_EXECUTION'; payload: { executionId: string; workflowId: string } }
  | { type: 'ADD_EVENT'; payload: ExecutionEvent }
  | { type: 'ADD_LOG'; payload: ExecutionLog }
  | { type: 'UPDATE_NODE_STATUS'; payload: { nodeId: string; status: string } }
  | { type: 'SET_CURRENT_NODE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'EXECUTION_COMPLETE'; payload: ExecutionSummary }
  | { type: 'EXECUTION_FAILED'; payload: string }
  | { type: 'EXECUTION_CANCELLED' }
  | { type: 'RESET' }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_LOGS'; payload: ExecutionLog[] }
  | { type: 'UPDATE_LOG'; payload: { nodeId: string; update: Partial<ExecutionLog> } }
  | { type: 'SET_CURRENT_EXECUTION'; payload: string | null }
  | { type: 'SET_IS_EXECUTING'; payload: boolean }

/**
 * Execution context value
 */
export interface ExecutionContextValue {
  state: ExecutionContextState
  dispatch: React.Dispatch<ExecutionAction>
}

/**
 * Create Execution context
 */
export const ExecutionContext = createContext<ExecutionContextValue | undefined>(undefined)

/**
 * Initial state for execution
 */
const initialState: ExecutionContextState = {
  executionId: null,
  workflowId: null,
  status: 'pending',
  currentNodeId: null,
  events: [],
  logs: [],
  summary: null,
  isRunning: false,
  error: null,
  progress: 0,
}

/**
 * Execution reducer function
 */
function executionReducer(state: ExecutionContextState, action: ExecutionAction): ExecutionContextState {
  switch (action.type) {
    case 'START_EXECUTION':
      return {
        ...initialState,
        executionId: action.payload.executionId,
        workflowId: action.payload.workflowId,
        status: 'running',
        isRunning: true,
        progress: 0,
      }

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      }

    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload],
      }

    case 'UPDATE_NODE_STATUS':
      return {
        ...state,
        logs: state.logs.map((log) =>
          log.nodeId === action.payload.nodeId
            ? { ...log, status: action.payload.status as any }
            : log
        ),
      }

    case 'SET_CURRENT_NODE':
      return {
        ...state,
        currentNodeId: action.payload,
      }

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: Math.min(100, Math.max(0, action.payload)),
      }

    case 'EXECUTION_COMPLETE':
      return {
        ...state,
        status: 'completed',
        isRunning: false,
        progress: 100,
        summary: action.payload,
      }

    case 'EXECUTION_FAILED':
      return {
        ...state,
        status: 'failed',
        isRunning: false,
        error: action.payload,
      }

    case 'EXECUTION_CANCELLED':
      return {
        ...state,
        status: 'cancelled',
        isRunning: false,
      }

    case 'RESET':
      return initialState

    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
      }

    case 'SET_LOGS':
      return {
        ...state,
        logs: action.payload,
      }

    case 'UPDATE_LOG':
      return {
        ...state,
        logs: state.logs.map((log) =>
          log.nodeId === action.payload.nodeId
            ? { ...log, ...action.payload.update }
            : log
        ),
      }

    case 'SET_CURRENT_EXECUTION':
      return {
        ...state,
        executionId: action.payload,
      }

    case 'SET_IS_EXECUTING':
      return {
        ...state,
        isRunning: action.payload,
      }

    default:
      return state
  }
}

/**
 * Execution Provider component
 */
export interface ExecutionProviderProps {
  children: React.ReactNode
}

export function ExecutionProvider({ children }: ExecutionProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(executionReducer, initialState)

  const value: ExecutionContextValue = {
    state,
    dispatch,
  }

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  )
}

/**
 * Hook to use Execution context
 */
export function useExecutionContext(): ExecutionContextValue {
  const context = React.useContext(ExecutionContext)
  if (!context) {
    throw new Error('useExecutionContext must be used within ExecutionProvider')
  }
  return context
}
