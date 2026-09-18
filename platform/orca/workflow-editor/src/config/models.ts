/**
 * API Model Configuration
 * Defines all available AI models and their provider endpoints
 */

export interface ModelConfig {
  id: string
  name: string
  provider: 'nvidia' | 'openai' | 'anthropic'
  endpoint: string
  apiKey: string
  maxTokens: number
  costPerToken: number
  icon?: string
  description?: string
}

/**
 * Load API key from environment variables with fallback
 */
function getApiKey(envKey: string): string {
  // @ts-ignore - Access Vite environment variables directly
  // VITE_* prefixed vars are available in import.meta.env at runtime
  return import.meta.env[envKey] || ''
}

/**
 * Available AI models and their configurations
 * Each model specifies the provider endpoint, authentication, token limits, and cost
 */
export const MODELS: Record<string, ModelConfig> = {
  'nvidia-llama2-70b': {
    id: 'nvidia-llama2-70b',
    name: 'NVIDIA Llama 2 70B',
    provider: 'nvidia',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: getApiKey('VITE_NVIDIA_API_KEY'),
    maxTokens: 2048,
    costPerToken: 0.00001,
    icon: '🚀',
    description: 'Fast, accurate responses from Meta Llama 2 70B on NVIDIA NIM',
  },

  'nvidia-nemotron': {
    id: 'nvidia-nemotron',
    name: 'NVIDIA Nemotron',
    provider: 'nvidia',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: getApiKey('VITE_NVIDIA_API_KEY'),
    maxTokens: 4096,
    costPerToken: 0.000008,
    icon: '⚡',
    description: 'NVIDIA proprietary model optimized for dialogue',
  },

  'openai-gpt4': {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: getApiKey('VITE_OPENAI_API_KEY'),
    maxTokens: 8000,
    costPerToken: 0.00003,
    icon: '🧠',
    description: 'Most capable OpenAI model for complex reasoning',
  },

  'openai-gpt4-turbo': {
    id: 'openai-gpt4-turbo',
    name: 'OpenAI GPT-4 Turbo',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: getApiKey('VITE_OPENAI_API_KEY'),
    maxTokens: 128000,
    costPerToken: 0.000015,
    icon: '🔥',
    description: 'Fast GPT-4 with larger context window',
  },

  'openai-gpt35-turbo': {
    id: 'openai-gpt35-turbo',
    name: 'OpenAI GPT-3.5 Turbo',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: getApiKey('VITE_OPENAI_API_KEY'),
    maxTokens: 4096,
    costPerToken: 0.0000015,
    icon: '💨',
    description: 'Fast and cost-effective model',
  },

  'anthropic-claude3-opus': {
    id: 'anthropic-claude3-opus',
    name: 'Anthropic Claude 3 Opus',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: getApiKey('VITE_ANTHROPIC_API_KEY'),
    maxTokens: 200000,
    costPerToken: 0.000015,
    icon: '🎯',
    description: 'Most intelligent Anthropic model for complex tasks',
  },

  'anthropic-claude3-sonnet': {
    id: 'anthropic-claude3-sonnet',
    name: 'Anthropic Claude 3 Sonnet',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: getApiKey('VITE_ANTHROPIC_API_KEY'),
    maxTokens: 200000,
    costPerToken: 0.000003,
    icon: '✨',
    description: 'Balanced speed and capability',
  },
}

/**
 * Get model configuration by ID
 */
export function getModel(modelId: string): ModelConfig | null {
  return MODELS[modelId] || null
}

/**
 * Get all available models
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(MODELS)
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: 'nvidia' | 'openai' | 'anthropic'): ModelConfig[] {
  return Object.values(MODELS).filter((m) => m.provider === provider)
}

/**
 * Validate that a model has a valid API key configured
 */
export function validateModelApiKey(modelId: string): { valid: boolean; error?: string } {
  const model = getModel(modelId)
  if (!model) {
    return { valid: false, error: `Model not found: ${modelId}` }
  }

  if (!model.apiKey || model.apiKey.trim() === '') {
    return {
      valid: false,
      error: `API key not configured for ${model.name}. Set VITE_${model.provider.toUpperCase()}_API_KEY environment variable.`,
    }
  }

  return { valid: true }
}

/**
 * Validate all configured models
 */
export function validateAllModels(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const model of Object.values(MODELS)) {
    const validation = validateModelApiKey(model.id)
    if (!validation.valid && validation.error) {
      errors.push(validation.error)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get default model (first available with valid API key)
 */
export function getDefaultModel(): ModelConfig | null {
  for (const model of Object.values(MODELS)) {
    if (validateModelApiKey(model.id).valid) {
      return model
    }
  }
  return null
}
