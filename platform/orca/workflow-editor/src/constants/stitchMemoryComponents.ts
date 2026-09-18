import { NEMOCLAW_AGENT_NODE_TYPES } from '../core/agents/nemoclawCore'

export interface StitchMemoryNodeType {
  label: string
  color: string
  description?: string
  category?: string
}

export const STITCH_MEMORY_NODE_TYPES: Record<string, StitchMemoryNodeType> = {
  'stitch.ai.workflowOrchestration': {
    label: 'Workflow Orchestration',
    color: '#99F6E4',
    category: 'AI Agents',
    description: 'Specialized agent capability for end-to-end operational workflows.',
  },
  'stitch.ai.cognitiveAnalysis': {
    label: 'Cognitive Analysis',
    color: '#A5B4FC',
    category: 'AI Agents',
    description: 'Analyze multi-dimensional data and detect patterns or anomalies.',
  },
  'stitch.ai.naturalLanguageOps': {
    label: 'Natural Language Ops',
    color: '#F0ABFC',
    category: 'AI Agents',
    description: 'Convert human intent into structured commands and workflow actions.',
  },
  'stitch.ai.agenticMemory': {
    label: 'Agentic Memory',
    color: '#67E8F9',
    category: 'AI Agents',
    description: 'Long-term context retention across sessions and workflow runs.',
  },
  'stitch.ai.executiveIntelligence': {
    label: 'Executive Intelligence',
    color: '#FDE68A',
    category: 'AI Agents',
    description: 'Strategic reasoning for prioritization, queues, and resource allocation.',
  },
  'stitch.ai.dataInterpretation': {
    label: 'Data Interpretation',
    color: '#86EFAC',
    category: 'AI Agents',
    description: 'Transform unstructured signals into telemetry and actionable insights.',
  },
  'stitch.ai.processAutomation': {
    label: 'Process Automation',
    color: '#FDBA74',
    category: 'AI Agents',
    description: 'Trigger cross-platform actions from state changes and business events.',
  },
  'stitch.ai.decisionSupport': {
    label: 'Decision Support',
    color: '#C4B5FD',
    category: 'AI Agents',
    description: 'Human-in-the-loop guidance for critical operational choices.',
  },
  'stitch.arch.agentCore': {
    label: 'Agent Core',
    color: '#A5B4FC',
    category: 'Architecture',
    description: 'Central autonomous reasoning layer connected to business systems.',
  },
  'stitch.arch.erpSystems': {
    label: 'ERP Systems',
    color: '#99F6E4',
    category: 'Architecture',
    description: 'Odoo/ERP operational source of truth for accounting, inventory, and sales.',
  },
  'stitch.arch.crmIntegrations': {
    label: 'CRM Integrations',
    color: '#67E8F9',
    category: 'Architecture',
    description: 'Customer and sales pipeline integrations feeding the agent layer.',
  },
  'stitch.arch.biPlatforms': {
    label: 'BI Platforms',
    color: '#86EFAC',
    category: 'Architecture',
    description: 'Dashboards and analytics destinations for interpreted operational data.',
  },
  'stitch.arch.externalApis': {
    label: 'External APIs',
    color: '#F0ABFC',
    category: 'Architecture',
    description: 'Third-party systems and web APIs connected through guarded tool calls.',
  },
  'stitch.rd.odooErp': {
    label: 'Odoo ERP',
    color: '#99F6E4',
    category: 'RD Operations',
    description: 'ERP implementation block for Dominican accounting, sales, inventory, and CRM.',
  },
  'stitch.rd.ecfBilling': {
    label: 'Facturación e-CF',
    color: '#FDE68A',
    category: 'RD Operations',
    description: 'DGII electronic invoicing workflow with validation and reporting.',
  },
  'stitch.rd.infrastructure': {
    label: 'Infrastructure',
    color: '#67E8F9',
    category: 'RD Operations',
    description: 'Servers, redundancy, storage, virtualization, and business continuity.',
  },
  'stitch.rd.enterpriseNetwork': {
    label: 'Enterprise Network',
    color: '#86EFAC',
    category: 'RD Operations',
    description: 'Structured cabling, Wi-Fi, routing, security, and branch connectivity.',
  },
  'stitch.ui.metricDashboard': {
    label: 'Metric Dashboard',
    color: '#A5B4FC',
    category: 'UI Patterns',
    description: 'Compact operational dashboard with KPI rows and health indicators.',
  },
  'stitch.ui.serviceGrid': {
    label: 'Service Grid',
    color: '#99F6E4',
    category: 'UI Patterns',
    description: 'Reusable glass-card grid for services, capabilities, or product modules.',
  },
  'stitch.ui.architectureMap': {
    label: 'Architecture Map',
    color: '#C4B5FD',
    category: 'UI Patterns',
    description: 'Central core plus connected system nodes for agent architecture views.',
  },
  'stitch.ui.diagnosticCta': {
    label: 'Diagnostic CTA',
    color: '#FDBA74',
    category: 'UI Patterns',
    description: 'Final conversion panel for diagnostics, strategy calls, and deployment actions.',
  },
  ...NEMOCLAW_AGENT_NODE_TYPES,
}

export const STITCH_MEMORY_CATEGORIES = [
  'Triggers',
  'AI',
  'Agent Core',
  'AI Agents',
  'Architecture',
  'RD Operations',
  'Network',
  'Control Flow',
  'UI Patterns',
  'Utils',
]
