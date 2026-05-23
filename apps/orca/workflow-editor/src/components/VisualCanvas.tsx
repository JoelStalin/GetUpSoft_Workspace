/**
 * VisualCanvas - 3D/2D Visual Editor Canvas
 *
 * Core rendering engine for the visual web editor.
 * Combines Three.js via React Three Fiber with interactive controls.
 *
 * FUTURO: Scaling considerations
 * - Implement multi-viewport system for split-screen editing
 * - Add infinite zoom with LOD (Level of Detail) rendering
 * - Create bird's-eye view for site architecture overview
 * - Implement real-time performance monitoring
 * - Add grid snapping and alignment guides
 * - Support 3D scene graph with node tree visualization
 * - Integrate Gizmo controls for precise positioning
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { IframeSection } from './IframeSection';
import { useEditorStore } from '../stores/useEditorStore';

interface VisualCanvasProps {
  /** Canvas width in pixels or percentage */
  width?: string | number;
  /** Canvas height in pixels or percentage */
  height?: string | number;
  /** Enable/disable orbit controls */
  enableControls?: boolean;
  /** Camera zoom level */
  zoom?: number;
  /** Background color */
  backgroundColor?: string;
}

/**
 * Main 3D Canvas Component
 *
 * Provides the interactive workspace where users can:
 * - View website layout in 3D space
 * - Move and resize sections
 * - Pan and zoom the view
 * - Edit HTML/CSS in live iframes
 */
export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  width = '100%',
  height = '100%',
  enableControls = true,
  zoom = 1,
  backgroundColor = '#0f1228',
}) => {
  const sections = useEditorStore((state) => state.sections);
  const updateSection = useEditorStore((state) => state.updateSection);

  // FUTURO: Add these features:
  // - useCallback for camera position tracking
  // - useRef for canvas DOM access
  // - Performance monitoring with stats.js
  // - Grid snap-to functionality
  // - Collision detection for sections

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        backgroundColor,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{
          position: [0, 10, 20],
          zoom,
          near: 0.1,
          far: 10000,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* Ambient lighting for the scene */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, 5]} intensity={0.4} />

        {/* Grid for reference */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellColor="#4a5568"
          sectionSize={10}
          sectionColor="#2d3748"
          fadeDistance={100}
          fadeStrength={0.1}
          infiniteGrid
        />

        {/* Interactive orbit controls */}
        {enableControls && (
          <OrbitControls
            enableDamping
            enablePan
            enableZoom
            autoRotate={false}
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={500}
            minZoom={0.1}
            maxZoom={10}
            // FUTURO: Add event handlers for analytics
            onChange={() => {
              // Track camera movement for undo/redo
            }}
          />
        )}

        {/* Render all section iframes in 3D space */}
        <Suspense fallback={<FallbackLoading />}>
          {sections.map((section) => (
            <IframeSection
              key={section.id}
              section={section}
              onUpdate={updateSection}
            />
          ))}
        </Suspense>

        {/* Performance monitor - FUTURO: Show FPS, draw calls, memory usage */}
        {/* <Perf position="top-left" /> */}
      </Canvas>

      {/* UI Overlay - FUTURO: Add these features */}
      {/* - Camera position indicator */}
      {/* - View presets (Top, Front, Isometric) */}
      {/* - Zoom level display */}
      {/* - Section count and total memory */}
      {/* - Performance metrics */}
    </div>
  );
};

/**
 * Fallback component while sections are loading
 */
const FallbackLoading: React.FC = () => {
  return (
    <Html center>
      <div style={{
        color: '#fff',
        fontSize: '16px',
        textAlign: 'center',
      }}>
        Loading sections...
      </div>
    </Html>
  );
};

export default VisualCanvas;
