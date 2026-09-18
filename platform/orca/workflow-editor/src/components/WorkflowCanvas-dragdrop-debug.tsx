import { useEffect, useRef } from 'react'

/**
 * Global drag-drop debugging component
 * Mounts at root level to capture ALL drag events in capture phase
 */
export function DragDropDebugger() {
  const isDraggingRef = useRef(false)
  const dragDataRef = useRef<string | null>(null)

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const data = e.dataTransfer?.getData('application/reactflow')
      if (data) {
        console.log('🟢 DRAG START:', data)
        isDraggingRef.current = true
        dragDataRef.current = data
      }
    }

    const handleDragOver = (e: DragEvent) => {
      if (isDraggingRef.current && dragDataRef.current) {
        console.log('🟡 DRAG OVER at', e.clientX, e.clientY)
        e.preventDefault()
        e.dataTransfer!.dropEffect = 'move'
      }
    }

    const handleDrop = (e: DragEvent) => {
      if (dragDataRef.current) {
        console.log('🔴 DROP event fired with:', dragDataRef.current)
        console.log('   Target:', (e.target as Element)?.className)
        e.preventDefault()
        e.stopPropagation()
      }
      isDraggingRef.current = false
      dragDataRef.current = null
    }

    const handleDragEnd = () => {
      console.log('⚫ DRAG END')
      isDraggingRef.current = false
      dragDataRef.current = null
    }

    // CAPTURE phase - fires BEFORE default handlers
    document.addEventListener('dragstart', handleDragStart, true)
    document.addEventListener('dragover', handleDragOver, true)
    document.addEventListener('drop', handleDrop, true)
    document.addEventListener('dragend', handleDragEnd, true)

    return () => {
      document.removeEventListener('dragstart', handleDragStart, true)
      document.removeEventListener('dragover', handleDragOver, true)
      document.removeEventListener('drop', handleDrop, true)
      document.removeEventListener('dragend', handleDragEnd, true)
    }
  }, [])

  return null
}
