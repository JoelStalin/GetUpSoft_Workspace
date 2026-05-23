/**
 * IframeSection - Live HTML/CSS Editor in 3D Space
 *
 * Renders an interactive iframe within the Three.js canvas.
 * Allows real-time editing of website sections.
 *
 * FUTURO: Advanced features
 * - Integrate GrapesJS or Craft.js for visual editing
 * - Add HTML/CSS syntax highlighting
 * - Live preview updates with CodeMirror
 * - CSS variables inspector
 * - Responsive preview at multiple breakpoints
 * - Asset management (images, fonts, icons)
 * - Undo/redo with Immer
 * - Real-time collaboration
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, TransformControls } from '@react-three/drei';
import { Vector3, Euler } from 'three';
import { IframeMessage, initPenpal } from '../utils/penpal-bridge';

interface SectionData {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  width: number;
  height: number;
  zIndex: number;
}

interface IframeSectionProps {
  section: SectionData;
  onUpdate: (sectionId: string, updates: Partial<SectionData>) => void;
}

/**
 * 3D iframe component for visual editing
 *
 * Features:
 * - Live HTML/CSS editing with transform controls
 * - Bi-directional communication via Penpal
 * - Responsive resizing
 * - Pointer events enabled for interactive editing
 */
export const IframeSection: React.FC<IframeSectionProps> = ({
  section,
  onUpdate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const transformRef = useRef<any>(null);
  const { camera } = useThree();

  // FUTURO: Implement these state management features
  // - useCallback for memoized update handlers
  // - useReducer for complex state transitions
  // - Context for parent-child communication
  // - Custom hooks for iframe state syncing

  /**
   * Initialize Penpal communication with iframe
   * Allows sending messages between parent and iframe
   */
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const initComms = async () => {
      try {
        const connection = await initPenpal(iframeRef.current!.contentWindow);

        // Listen for CSS changes from iframe
        connection.iframe.onCssChange = (css: string) => {
          console.log('CSS updated in iframe:', css);
          // FUTURO: Update Zustand store with new CSS
          // FUTURO: Broadcast to other sections
        };

        // Listen for HTML structure changes
        connection.iframe.onHtmlChange = (html: string) => {
          console.log('HTML updated in iframe:', html);
          // FUTURO: Validate HTML, update preview
        };
      } catch (error) {
        console.error('Failed to initialize iframe communication:', error);
      }
    };

    initComms();
  }, [section.id, iframeRef]);

  /**
   * Handle transform changes (move, rotate, scale)
   * Updates the section position in the store
   */
  const handleTransformChange = useCallback(() => {
    if (!transformRef.current) return;

    const position = transformRef.current.position.toArray() as [number, number, number];
    const rotation = transformRef.current.rotation.toArray().slice(0, 3) as [number, number, number];
    const scale = transformRef.current.scale.toArray() as [number, number, number];

    onUpdate(section.id, { position, rotation, scale });

    // FUTURO: Features to add
    // - Snap to grid
    // - Alignment guides
    // - Constrain to 2D (Y-axis only)
    // - Multi-select transform
    // - Transform history for undo/redo
  }, [section.id, onUpdate]);

  // FUTURO: Add keyboard shortcuts
  // - Delete: Remove section
  // - Ctrl+D: Duplicate
  // - Ctrl+C/V: Copy/paste
  // - Arrow keys: Fine-tune position
  // - Z: Cycle through sections

  return (
    <TransformControls
      ref={transformRef}
      position={new Vector3(...section.position)}
      rotation={new Euler(...section.rotation)}
      scale={new Vector3(...section.scale)}
      onChange={handleTransformChange}
      // Gizmo configuration
      mode="translate"
      space="local"
      size={0.75}
      showX
      showY
      showZ
    >
      <Html
        transform
        position={new Vector3(...section.position)}
        rotation={new Euler(...section.rotation)}
        scale={new Vector3(...section.scale)}
        // CSS 3D transformation
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            width: section.width,
            height: section.height,
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '2px solid #4a9eff',
            boxShadow: '0 0 20px rgba(74, 158, 255, 0.4)',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'grab',
            zIndex: section.zIndex,
          }}
        >
          {/* Live iframe for editing */}
          <iframe
            ref={iframeRef}
            src={section.url}
            title={`Section: ${section.id}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'auto', // Critical: Enable interaction
              touchAction: 'auto',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            // FUTURO: Add sandbox attributes as needed
            // allow-top-navigation - for navigation links
            // allow-downloads - for downloadable assets
          />

          {/* FUTURO: Add overlay UI elements */}
          {/* - Section label badge */}
          {/* - Edit button */}
          {/* - Delete button */}
          {/* - Duplicate button */}
          {/* - Settings icon */}
        </div>
      </Html>
    </TransformControls>
  );
};

export default IframeSection;
