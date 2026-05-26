/**
 * VisualCanvas - 3D/2D Visual Editor Canvas (DISABLED)
 *
 * This component requires @react-three/fiber and @react-three/drei.
 * Currently disabled to avoid dependency version conflicts.
 */

import React from 'react'

interface VisualCanvasProps {
  width?: string | number
  height?: string | number
  enableControls?: boolean
  zoom?: number
  backgroundColor?: string
}

export const VisualCanvas: React.FC<VisualCanvasProps> = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#666',
        fontSize: '14px',
      }}
    >
      VisualCanvas component disabled (requires React Three Fiber)
    </div>
  )
}

export default VisualCanvas
