// ─── ORCA Mode System ───────────────────────────────────────────────────────
// Each mode renders a different canvas/view while sharing the same shell.

export type AppMode = 'workflow' | 'web' | 'mobile' | 'ai'

export interface ModeDefinition {
  id: AppMode
  label: string
  shortcut?: string
  description: string
}

export const MODES: ModeDefinition[] = [
  {
    id: 'web',
    label: 'Web Design',
    shortcut: '1',
    description: 'Visual web design canvas',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    shortcut: '2',
    description: 'Node-based automation workflow editor',
  },
  {
    id: 'mobile',
    label: 'Mobile Design',
    shortcut: '3',
    description: 'Mobile-optimized design preview',
  },
  {
    id: 'ai',
    label: 'AI',
    shortcut: '4',
    description: 'AI orchestration and chat interface',
  },
]
