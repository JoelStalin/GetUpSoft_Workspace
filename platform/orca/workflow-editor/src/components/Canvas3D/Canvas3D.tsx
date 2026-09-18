import React, { useEffect, useRef } from 'react'
import { WorkflowScene } from './Scene'

export const Canvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<WorkflowScene | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Wait for container to have dimensions
    const checkAndInitialize = () => {
      const container = containerRef.current
      if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
        requestAnimationFrame(checkAndInitialize)
        return
      }

      // Initialize Three.js scene
      try {
        const scene = new WorkflowScene(container)
        sceneRef.current = scene
      } catch (error) {
        console.error('[Canvas3D] Error creating WorkflowScene:', error)
      }
    }

    checkAndInitialize()

    // Cleanup on unmount
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0e27]"
    />
  )
}
