import {
  Bell,
  Brain,
  Cloud,
  GitBranch,
  Repeat,
  Code2,
  Terminal,
  Square,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'orca-nodes-base.trigger': Bell,
  'orca-nodes-base.aiPrompt': Brain,
  'orca-nodes-base.httpRequest': Cloud,
  'orca-nodes-base.condition': GitBranch,
  'orca-nodes-base.loop': Repeat,
  'orca-nodes-base.setVariable': Code2,
  'orca-nodes-base.executeCommand': Terminal,
  'orca-nodes-base.end': Square,
}

export function getNodeIcon(nodeType: string): LucideIcon | null {
  return iconMap[nodeType] || null
}

export default iconMap
