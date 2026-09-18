import { useState, useCallback } from 'react'
import { WorkflowNode } from '../types/workflow'

interface ClipboardData {
  nodes: WorkflowNode[]
  timestamp: number
}

export function useClipboard() {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null)

  const copy = useCallback((nodes: WorkflowNode[]) => {
    if (nodes.length === 0) return

    setClipboard({
      nodes: nodes.map(node => ({ ...node })),
      timestamp: Date.now(),
    })

    // Also copy to system clipboard as JSON
    const data = JSON.stringify({
      type: 'workflow-nodes',
      nodes: nodes.map(({ id, data, position, type }) => ({
        id,
        data,
        position,
        type,
      })),
    })

    navigator.clipboard.writeText(data).catch(() => {
      console.log('Could not access system clipboard')
    })
  }, [])

  const paste = useCallback((offsetX = 50, offsetY = 50) => {
    if (!clipboard || clipboard.nodes.length === 0) {
      return []
    }

    return clipboard.nodes.map(node => ({
      ...node,
      id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY,
      },
    }))
  }, [clipboard])

  const clear = useCallback(() => {
    setClipboard(null)
  }, [])

  const hasContent = useCallback(() => {
    return clipboard !== null && clipboard.nodes.length > 0
  }, [clipboard])

  return {
    copy,
    paste,
    clear,
    hasContent,
    clipboard,
  }
}
