/**
 * IframeSection - Live HTML/CSS Editor in 3D Space (DISABLED)
 *
 * This component requires @react-three/fiber and @react-three/drei.
 * Currently disabled to avoid dependency version conflicts.
 */

import React from 'react'

interface SectionData {
  id: string
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  width: number
  height: number
  zIndex: number
}

interface IframeSectionProps {
  section: SectionData
  onUpdate: (sectionId: string, updates: Partial<SectionData>) => void
}

export const IframeSection: React.FC<IframeSectionProps> = () => {
  return null
}

export default IframeSection
