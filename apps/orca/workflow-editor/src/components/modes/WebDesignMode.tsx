import { useEffect, useMemo, useState } from 'react'
import {
  Copy,
  Gauge,
  GitBranch,
  LayoutGrid,
  Monitor,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Node } from '@xyflow/react'
import { useWorkflowOperations } from '../../hooks/useWorkflowOperations'
import { useWorkflowHistory } from '../../hooks/useWorkflowHistory'
import { loadStylesheet } from '../../utils/resourceLoader'

type LayoutSectionType = 'hero' | 'service-grid' | 'metric-dashboard' | 'architecture-map' | 'diagnostic-cta'

interface WebLayout {
  id: string
  name: string
  viewport: 'desktop' | 'tablet' | 'mobile'
  sections: LayoutSectionType[]
}

const STORAGE_KEY = 'orca_web_design_layouts_v1'

const SECTION_PRESETS: Array<{
  type: LayoutSectionType
  label: string
  color: string
  icon: React.ElementType
  description: string
}> = [
  {
    type: 'hero',
    label: 'Hero Panel',
    color: '#99F6E4',
    icon: Sparkles,
    description: 'Headline, eyebrow, supporting copy, and actions from the Stitch hero pattern.',
  },
  {
    type: 'service-grid',
    label: 'Service Grid',
    color: '#A5B4FC',
    icon: LayoutGrid,
    description: 'Reusable glass cards for services, AI capabilities, Odoo modules, and APIs.',
  },
  {
    type: 'metric-dashboard',
    label: 'Metric Dashboard',
    color: '#86EFAC',
    icon: Gauge,
    description: 'Compact KPI/health dashboard inspired by the RD infrastructure captures.',
  },
  {
    type: 'architecture-map',
    label: 'Architecture Map',
    color: '#C4B5FD',
    icon: GitBranch,
    description: 'Agent Core connected to ERP, CRM, BI, and external API systems.',
  },
  {
    type: 'diagnostic-cta',
    label: 'Diagnostic CTA',
    color: '#FDBA74',
    icon: Sparkles,
    description: 'Final conversion/diagnostic block with operational call to action.',
  },
]

function defaultLayouts(): WebLayout[] {
  return [
    {
      id: 'layout-home',
      name: 'GetUpSoft Portal',
      viewport: 'desktop',
      sections: ['hero', 'service-grid', 'metric-dashboard', 'diagnostic-cta'],
    },
    {
      id: 'layout-ai-agents',
      name: 'AI Agents',
      viewport: 'desktop',
      sections: ['hero', 'service-grid', 'architecture-map', 'diagnostic-cta'],
    },
  ]
}

function loadLayouts(): WebLayout[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultLayouts()
  } catch {
    return defaultLayouts()
  }
}

export default function WebDesignMode() {
  const [layouts, setLayouts] = useState<WebLayout[]>(loadLayouts)
  const [activeLayoutId, setActiveLayoutId] = useState(layouts[0]?.id || 'layout-home')
  const { addNode } = useWorkflowOperations()
  const { pushHistory } = useWorkflowHistory()

  useEffect(() => {
    loadStylesheet(
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap',
      'stitch-fonts-space-grotesk-plus-jakarta'
    ).catch(() => {
      // Fonts are a visual enhancement; local fallbacks keep the editor usable.
    })
  }, [])

  const activeLayout = useMemo(
    () => layouts.find((layout) => layout.id === activeLayoutId) || layouts[0],
    [activeLayoutId, layouts]
  )

  const persistLayouts = (next: WebLayout[]) => {
    setLayouts(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const createLayout = () => {
    const id = `layout-${Date.now()}`
    const next: WebLayout[] = [
      ...layouts,
      {
        id,
        name: `Layout ${layouts.length + 1}`,
        viewport: 'desktop' as const,
        sections: ['hero', 'service-grid'] as LayoutSectionType[],
      },
    ]
    persistLayouts(next)
    setActiveLayoutId(id)
  }

  const duplicateLayout = () => {
    if (!activeLayout) return
    const id = `layout-${Date.now()}`
    const copy = { ...activeLayout, id, name: `${activeLayout.name} Copy` }
    persistLayouts([...layouts, copy])
    setActiveLayoutId(id)
  }

  const deleteLayout = () => {
    if (!activeLayout || layouts.length <= 1) return
    const next = layouts.filter((layout) => layout.id !== activeLayout.id)
    persistLayouts(next)
    setActiveLayoutId(next[0].id)
  }

  const addSectionToCanvas = (sectionType: LayoutSectionType) => {
    if (!activeLayout) return
    const preset = SECTION_PRESETS.find((section) => section.type === sectionType)
    if (!preset) return

    pushHistory()
    const index = activeLayout.sections.indexOf(sectionType)
    const node: Node = {
      id: `web-${sectionType}-${Date.now()}`,
      type: 'default',
      position: {
        x: 160 + Math.max(index, 0) * 260,
        y: 320 + layouts.findIndex((layout) => layout.id === activeLayout.id) * 80,
      },
      data: {
        label: preset.label,
        type: `web.layout.${sectionType}`,
        color: preset.color,
        mode: 'web',
        layoutId: activeLayout.id,
        layoutName: activeLayout.name,
        description: preset.description,
      },
    }
    addNode(node as any)
  }

  return (
    <aside className="orca-mode-panel orca-mode-panel--left" aria-label="Web design layouts">
      <div className="orca-mode-panel__header">
        <div>
          <div className="orca-mode-panel__eyebrow">Web Design</div>
          <div className="orca-mode-panel__title">Layouts</div>
        </div>
        <button className="orca-icon-button" title="New layout" onClick={createLayout}>
          <Plus size={15} />
        </button>
      </div>

      <div className="orca-layout-list">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className={layout.id === activeLayout?.id ? 'orca-layout-item orca-layout-item--active' : 'orca-layout-item'}
            onClick={() => setActiveLayoutId(layout.id)}
          >
            <Monitor size={14} />
            <span>{layout.name}</span>
            <small>{layout.sections.length}</small>
          </button>
        ))}
      </div>

      {activeLayout && (
        <>
          <div className="orca-mode-panel__toolbar">
            <button className="orca-small-action" onClick={duplicateLayout}>
              <Copy size={13} />
              Duplicate
            </button>
            <button className="orca-small-action" onClick={deleteLayout} disabled={layouts.length <= 1}>
              <Trash2 size={13} />
              Delete
            </button>
          </div>

          <div className="orca-mode-panel__section-title">Sections</div>
          <div className="orca-section-palette">
            {SECTION_PRESETS.map(({ type, label, color, icon: Icon, description }) => {
              const isInLayout = activeLayout.sections.includes(type)
              return (
                <button
                  key={type}
                  className="orca-section-card"
                  onClick={() => addSectionToCanvas(type)}
                  title="Add section to shared canvas"
                >
                  <span className="orca-section-card__icon" style={{ color, backgroundColor: `${color}18` }}>
                    <Icon size={15} />
                  </span>
                  <span className="orca-section-card__body">
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  {isInLayout && <span className="orca-section-card__badge">layout</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </aside>
  )
}
