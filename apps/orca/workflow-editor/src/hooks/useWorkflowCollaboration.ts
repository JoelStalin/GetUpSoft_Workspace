'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../contexts/ToastContext'

/**
 * Collaboration event types
 */
export type CollaborationEventType = 'node-added' | 'node-deleted' | 'node-updated' | 'edge-added' | 'edge-deleted' | 'workflow-updated' | 'user-joined' | 'user-left'

/**
 * Collaboration event
 */
export interface CollaborationEvent {
  type: CollaborationEventType
  userId: string
  userName?: string
  timestamp: string
  data: Record<string, any>
  workflowId: string
}

/**
 * Active collaborator
 */
export interface Collaborator {
  id: string
  name: string
  color: string
  lastSeen: string
  isActive: boolean
}

/**
 * Hook for managing workflow collaboration
 * Handles real-time updates and multi-user synchronization
 */
export function useWorkflowCollaboration(workflowId: string | null) {
  const { addToast } = useToast()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const userIdRef = useRef<string>(generateUserId())
  const userNameRef = useRef<string>(`User-${userIdRef.current.slice(0, 4)}`)

  // Connect to collaboration channel
  useEffect(() => {
    if (!workflowId) {
      return
    }

    connectToCollaborationChannel(workflowId)

    return () => {
      disconnectFromCollaborationChannel()
    }
  }, [workflowId])

  const connectToCollaborationChannel = (wfId: string) => {
    try {
      // Close previous connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Connect to collaboration channel via SSE
      const eventSource = new EventSource(`/api/workflows/${wfId}/collaborate/${userIdRef.current}`)

      eventSource.onopen = () => {
        setIsConnected(true)
        addToast('Connected to collaboration channel', 'success')
        broadcastUserJoined()
      }

      eventSource.onmessage = (event) => {
        try {
          const collaborationEvent = JSON.parse(event.data) as CollaborationEvent

          // Update collaborators list
          updateCollaborators(collaborationEvent)

          // Broadcast the event to listeners
          window.dispatchEvent(
            new CustomEvent('collaboration-event', {
              detail: collaborationEvent,
            })
          )
        } catch (e) {
          console.error('Failed to parse collaboration event:', e)
        }
      }

      eventSource.onerror = () => {
        console.warn('Collaboration connection error')
        eventSource.close()
        setIsConnected(false)
        addToast('Disconnected from collaboration', 'warning')
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Failed to connect to collaboration:', error)
      addToast('Failed to connect to collaboration', 'error')
    }
  }

  const disconnectFromCollaborationChannel = () => {
    if (eventSourceRef.current) {
      try {
        // Broadcast user left
        broadcastUserLeft()
      } catch (e) {
        console.error('Error broadcasting user left:', e)
      }

      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }

  const updateCollaborators = (event: CollaborationEvent) => {
    if (event.type === 'user-joined' && event.userId !== userIdRef.current) {
      setCollaborators((prev) => {
        const exists = prev.find((c) => c.id === event.userId)
        if (exists) {
          return prev.map((c) =>
            c.id === event.userId ? { ...c, lastSeen: event.timestamp, isActive: true } : c
          )
        }
        return [
          ...prev,
          {
            id: event.userId,
            name: event.userName || `User-${event.userId.slice(0, 4)}`,
            color: generateColorForUser(event.userId),
            lastSeen: event.timestamp,
            isActive: true,
          },
        ]
      })
    } else if (event.type === 'user-left' && event.userId !== userIdRef.current) {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === event.userId ? { ...c, isActive: false } : c
        )
      )
    }
  }

  /**
   * Broadcast a collaboration event
   */
  const broadcastEvent = useCallback(
    async (eventType: CollaborationEventType, eventData: Record<string, any>) => {
      if (!workflowId || !isConnected) {
        return
      }

      try {
        await fetch(`/api/workflows/${workflowId}/collaborate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: eventType,
            userId: userIdRef.current,
            userName: userNameRef.current,
            timestamp: new Date().toISOString(),
            data: eventData,
            workflowId,
          }),
        })
      } catch (error) {
        console.error('Failed to broadcast collaboration event:', error)
      }
    },
    [workflowId, isConnected]
  )

  /**
   * Broadcast that user has joined
   */
  const broadcastUserJoined = useCallback(() => {
    broadcastEvent('user-joined', {
      userId: userIdRef.current,
      userName: userNameRef.current,
    })
  }, [broadcastEvent])

  /**
   * Broadcast that user has left
   */
  const broadcastUserLeft = useCallback(() => {
    broadcastEvent('user-left', {
      userId: userIdRef.current,
    })
  }, [broadcastEvent])

  /**
   * Get current user info
   */
  const getCurrentUser = useCallback(() => {
    return {
      id: userIdRef.current,
      name: userNameRef.current,
      color: generateColorForUser(userIdRef.current),
    }
  }, [])

  /**
   * Set current user name
   */
  const setCurrentUserName = useCallback((name: string) => {
    userNameRef.current = name
  }, [])

  return {
    // State
    collaborators,
    isConnected,

    // Operations
    broadcastEvent,
    broadcastUserJoined,
    broadcastUserLeft,
    getCurrentUser,
    setCurrentUserName,

    // Utilities
    disconnect: disconnectFromCollaborationChannel,
  }
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Generate a consistent color for a user based on their ID
 */
function generateColorForUser(userId: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
