import React, { createContext, useCallback, useReducer } from 'react'
import { ApiError, NetworkError, TimeoutError, ExecutionError } from '../constants/errors'

/**
 * Error recovery state
 */
export interface ErrorRecoveryState {
  readonly errors: readonly ErrorRecord[]
  readonly maxErrors: number
  readonly isRecovering: boolean
  readonly lastRecoveryTime?: string
}

/**
 * Single error record
 */
export interface ErrorRecord {
  readonly id: string
  readonly error: Error
  readonly context?: string
  readonly timestamp: string
  readonly retryable: boolean
  readonly retryCount: number
  readonly maxRetries: number
}

/**
 * Error recovery actions
 */
export type ErrorRecoveryAction =
  | { type: 'ADD_ERROR'; payload: Omit<ErrorRecord, 'id'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'INCREMENT_RETRY'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'START_RECOVERY' }
  | { type: 'COMPLETE_RECOVERY' }

/**
 * Error recovery context value
 */
export interface ErrorRecoveryContextValue {
  state: ErrorRecoveryState
  dispatch: React.Dispatch<ErrorRecoveryAction>
}

/**
 * Create error recovery context
 */
const ErrorRecoveryContext = createContext<ErrorRecoveryContextValue | undefined>(undefined)

/**
 * Initial state
 */
const initialState: ErrorRecoveryState = {
  errors: [],
  maxErrors: 10,
  isRecovering: false,
}

/**
 * Error recovery reducer
 */
function errorRecoveryReducer(
  state: ErrorRecoveryState,
  action: ErrorRecoveryAction
): ErrorRecoveryState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newErrors = [
        ...state.errors,
        {
          ...action.payload,
          id: `error-${Date.now()}-${Math.random()}`,
        },
      ]

      if (newErrors.length > state.maxErrors) {
        newErrors.shift()
      }

      return { ...state, errors: newErrors }
    }

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter((e) => e.id !== action.payload),
      }

    case 'INCREMENT_RETRY': {
      const errors = state.errors.map((e) =>
        e.id === action.payload ? { ...e, retryCount: e.retryCount + 1 } : e
      )
      return { ...state, errors }
    }

    case 'CLEAR_ERRORS':
      return { ...state, errors: [] }

    case 'START_RECOVERY':
      return { ...state, isRecovering: true }

    case 'COMPLETE_RECOVERY':
      return {
        ...state,
        isRecovering: false,
        lastRecoveryTime: new Date().toISOString(),
      }

    default:
      return state
  }
}

/**
 * Error recovery provider component
 */
export function ErrorRecoveryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(errorRecoveryReducer, initialState)

  return (
    <ErrorRecoveryContext.Provider value={{ state, dispatch }}>
      {children}
    </ErrorRecoveryContext.Provider>
  )
}

/**
 * Hook to use error recovery context
 */
export function useErrorRecoveryContext() {
  const context = React.useContext(ErrorRecoveryContext)
  if (!context) {
    throw new Error('useErrorRecoveryContext must be used within ErrorRecoveryProvider')
  }
  return context
}

/**
 * Hook to add and manage errors
 */
export function useErrorRecovery() {
  const { state, dispatch } = useErrorRecoveryContext()

  const addError = useCallback(
    (error: Error, context?: string, maxRetries: number = 3) => {
      const retryable =
        error instanceof NetworkError ||
        error instanceof TimeoutError ||
        (error instanceof ApiError && error.statusCode >= 500) ||
        (error instanceof ApiError && error.statusCode === 429)

      dispatch({
        type: 'ADD_ERROR',
        payload: {
          error,
          context,
          timestamp: new Date().toISOString(),
          retryable,
          retryCount: 0,
          maxRetries,
        },
      })
    },
    [dispatch]
  )

  const removeError = useCallback(
    (errorId: string) => {
      dispatch({ type: 'REMOVE_ERROR', payload: errorId })
    },
    [dispatch]
  )

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [dispatch])

  const incrementRetry = useCallback(
    (errorId: string) => {
      dispatch({ type: 'INCREMENT_RETRY', payload: errorId })
    },
    [dispatch]
  )

  const startRecovery = useCallback(() => {
    dispatch({ type: 'START_RECOVERY' })
  }, [dispatch])

  const completeRecovery = useCallback(() => {
    dispatch({ type: 'COMPLETE_RECOVERY' })
  }, [dispatch])

  return {
    state,
    addError,
    removeError,
    clearErrors,
    incrementRetry,
    startRecovery,
    completeRecovery,
    hasErrors: state.errors.length > 0,
    retryableErrors: state.errors.filter((e) => e.retryable),
  }
}
