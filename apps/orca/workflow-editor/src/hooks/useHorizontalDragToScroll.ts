import { useRef, useEffect, useState } from 'react'

interface UseDragToScrollOptions {
  enabled?: boolean
  sensitivity?: number
}

export function useHorizontalDragToScroll(options: UseDragToScrollOptions = {}) {
  const { enabled = true, sensitivity = 1 } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      setDragStart({
        x: e.clientX,
        scrollLeft: container.scrollLeft,
      })
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const delta = (e.clientX - dragStart.x) * sensitivity
      container.scrollLeft = dragStart.scrollLeft - delta
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      container.style.cursor = 'grab'
      container.style.userSelect = 'auto'
    }

    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [enabled, isDragging, dragStart, sensitivity])

  return containerRef
}
