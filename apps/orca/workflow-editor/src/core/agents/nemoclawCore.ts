export type NemoClawLifecycleStage = 'resolve' | 'verify' | 'plan' | 'apply' | 'status' | 'rollback'

export interface NemoClawInferenceProfile {
  id: string
  providerType: 'nvidia' | 'openai' | 'anthropic' | 'google' | 'other'
  providerName: string
  endpoint: string
  model: string
  credentialEnv?: string
  notes?: string
}

export interface NemoClawCoreProfile {
  id: 'nemoclaw'
  label: string
  sourceRepo: string
  localReferencePath: string
  license: string
  status: 'reference-integrated'
  architecture: {
    plugin: string
    blueprint: string
    sandbox: string
    inference: string
    policy: string
  }
  lifecycle: NemoClawLifecycleStage[]
  protectionLayers: Array<'network' | 'filesystem' | 'process' | 'inference'>
  inferenceProfiles: NemoClawInferenceProfile[]
}

export const NEMOCLAW_CORE_PROFILE: NemoClawCoreProfile = {
  id: 'nemoclaw',
  label: 'NemoClaw Sandboxed Agent Core',
  sourceRepo: 'https://github.com/JoelStalin/NemoClaw.git',
  localReferencePath: '03_AI_Automation/NemoClaw',
  license: 'Apache-2.0',
  status: 'reference-integrated',
  architecture: {
    plugin: 'TypeScript OpenClaw plugin registering /nemoclaw commands and managed inference provider.',
    blueprint: 'Versioned blueprint manifest and runner for plan/apply/status/rollback lifecycle.',
    sandbox: 'OpenShell sandbox running OpenClaw with confined filesystem, process, and network access.',
    inference: 'Provider-routed inference through OpenShell gateway; raw keys remain host-side.',
    policy: 'Declarative network and filesystem policy with session approvals for blocked egress.',
  },
  lifecycle: ['resolve', 'verify', 'plan', 'apply', 'status', 'rollback'],
  protectionLayers: ['network', 'filesystem', 'process', 'inference'],
  inferenceProfiles: [
    {
      id: 'default',
      providerType: 'nvidia',
      providerName: 'nvidia-inference',
      endpoint: 'https://integrate.api.nvidia.com/v1',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      notes: 'Hosted NVIDIA endpoint profile from NemoClaw blueprint.',
    },
    {
      id: 'ncp',
      providerType: 'nvidia',
      providerName: 'nvidia-ncp',
      endpoint: '',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      credentialEnv: 'NVIDIA_API_KEY',
      notes: 'Dynamic NVIDIA endpoint profile.',
    },
    {
      id: 'nim-local',
      providerType: 'openai',
      providerName: 'nim-local',
      endpoint: 'http://nim-service.local:8000/v1',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      credentialEnv: 'NIM_API_KEY',
      notes: 'Local NIM route through sandbox policy.',
    },
    {
      id: 'vllm',
      providerType: 'openai',
      providerName: 'vllm-local',
      endpoint: 'http://localhost:8000/v1',
      model: 'nvidia/nemotron-3-nano-30b-a3b',
      credentialEnv: 'OPENAI_API_KEY',
      notes: 'Experimental local vLLM-compatible route.',
    },
  ],
}

export const NEMOCLAW_AGENT_NODE_TYPES = {
  'nemoclaw.core.sandbox': {
    label: 'NemoClaw Sandbox',
    color: '#76B900',
    category: 'Agent Core',
    description: 'OpenShell sandbox layer for isolated OpenClaw agent execution.',
  },
  'nemoclaw.core.policy': {
    label: 'NemoClaw Policy',
    color: '#99F6E4',
    category: 'Agent Core',
    description: 'Declarative network, filesystem, process, and inference policy controls.',
  },
  'nemoclaw.core.inferenceRoute': {
    label: 'Inference Route',
    color: '#A5B4FC',
    category: 'Agent Core',
    description: 'Managed provider route that keeps raw provider credentials on the host.',
  },
  'nemoclaw.core.blueprintPlan': {
    label: 'Blueprint Plan',
    color: '#FDE68A',
    category: 'Agent Core',
    description: 'Resolve, verify, plan, apply, status, and rollback lifecycle from NemoClaw.',
  },
  'nemoclaw.core.statusMonitor': {
    label: 'Sandbox Status',
    color: '#86EFAC',
    category: 'Agent Core',
    description: 'Sandbox health and run-state monitor for agent operations.',
  },
}
