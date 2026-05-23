import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderConfigRequestDto, ProviderValidationRequestDto } from './dto/providers.dto';

export interface ProviderInfo {
  name: string;
  description: string;
  url: string;
  status_page: string;
  models: string[];
}

@Injectable()
export class ProvidersService {
  constructor(private readonly config: ConfigService) {}

  private readonly providers: Record<string, ProviderInfo> = {
    openai: {
      name: 'OpenAI',
      description: 'GPT models for documentation, SEO, copywriting, and automation.',
      url: 'https://platform.openai.com',
      status_page: 'https://status.openai.com',
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    },
    claude: {
      name: 'Anthropic Claude',
      description: 'Claude models for planning, code review, and architecture.',
      url: 'https://console.anthropic.com',
      status_page: 'https://status.anthropic.com',
      models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Gemini models for multimodal and UI design workflows.',
      url: 'https://cloud.google.com',
      status_page: 'https://status.cloud.google.com',
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'imagen-3'],
    },
    manus: {
      name: 'Manus AI',
      description: 'Social media automation and content scheduling provider.',
      url: 'https://manus.ai',
      status_page: 'https://manus.ai/status',
      models: ['manus-social', 'manus-analytics'],
    },
  };

  private readonly credentials = new Map<string, Map<string, string>>();
  private readonly providerConfigs = new Map<string, Map<string, { config: Record<string, unknown>; saved_at: string }>>();

  listProviders() {
    return {
      providers: this.providers,
      total: Object.keys(this.providers).length,
    };
  }

  getProvider(provider: string) {
    const info = this.providers[provider];
    if (!info) throw new NotFoundException(`Unknown provider: ${provider}`);
    return { [provider]: info };
  }

  async validateProvider(provider: string, request: ProviderValidationRequestDto) {
    this.ensureProvider(provider);
    const apiKey = request.api_key?.trim();
    if (!apiKey) {
      throw new BadRequestException(`No API key provided for ${provider}`);
    }
    if (this.liveValidationEnabled()) {
      return this.validateProviderLive(provider, apiKey);
    }
    return {
      valid: true,
      provider,
      message: `Validation request accepted for ${this.providers[provider].name}`,
      mode: 'offline-contract-validation',
    };
  }

  providerStatus(userId = 'default') {
    const configured = this.credentials.get(userId) ?? new Map<string, string>();
    const providers = Object.entries(this.providers).map(([provider, info]) => {
      const secret = configured.get(provider);
      return {
        ...info,
        provider,
        configured: Boolean(secret),
        scope: secret ? 'user' : null,
        source: secret ? 'memory_store' : null,
        masked_value: secret ? this.maskSecret(secret) : null,
        env_name: `${provider.toUpperCase()}_API_KEY`,
      };
    });

    return {
      providers,
      configured_count: providers.filter((provider) => provider.configured).length,
      total: providers.length,
    };
  }

  connectProvider(provider: string, request: ProviderValidationRequestDto, userId = 'default') {
    this.ensureProvider(provider);
    const apiKey = request.api_key?.trim();
    if (!apiKey) throw new BadRequestException('API key is required');
    const userCredentials = this.credentials.get(userId) ?? new Map<string, string>();
    userCredentials.set(provider, apiKey);
    this.credentials.set(userId, userCredentials);
    return { provider, configured: true, user_id: userId };
  }

  disconnectProvider(provider: string, userId = 'default') {
    this.ensureProvider(provider);
    const userCredentials = this.credentials.get(userId);
    const deleted = userCredentials?.delete(provider) ?? false;
    if (!deleted) throw new NotFoundException(`No credentials configured for ${provider}`);
    return { provider, disconnected: true, user_id: userId };
  }

  saveProviderConfig(request: ProviderConfigRequestDto) {
    this.ensureProvider(request.provider_id);
    const userConfigs = this.providerConfigs.get(request.user_id) ?? new Map<string, { config: Record<string, unknown>; saved_at: string }>();
    userConfigs.set(request.provider_id, {
      config: request.config,
      saved_at: new Date().toISOString(),
    });
    this.providerConfigs.set(request.user_id, userConfigs);
    return {
      message: `${request.provider_id} configuration saved`,
      provider_id: request.provider_id,
      user_id: request.user_id,
    };
  }

  getProviderConfig(providerId: string, userId = 'default') {
    this.ensureProvider(providerId);
    const config = this.providerConfigs.get(userId)?.get(providerId);
    if (!config) throw new NotFoundException(`No config found for ${providerId}`);
    return {
      provider_id: providerId,
      configured: true,
      saved_at: config.saved_at,
    };
  }

  async testProvider(providerId: string, userId = 'default') {
    this.ensureProvider(providerId);
    const config = this.providerConfigs.get(userId)?.get(providerId);
    if (!config) return { success: false, error: 'No configuration found' };
    if (this.liveValidationEnabled()) {
      const key = this.extractConfiguredSecret(config.config);
      if (!key) return { success: false, error: 'No API key available for live validation' };
      try {
        const result = await this.validateProviderLive(providerId, key);
        return {
          success: result.valid,
          provider_id: providerId,
          mode: result.mode,
          status_code: result.status_code,
          message: result.message,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return { success: false, provider_id: providerId, mode: 'live-provider-validation', error: error.message };
        }
        throw error;
      }
    }
    return {
      success: true,
      provider_id: providerId,
      mode: 'offline-contract-validation',
      message: `${providerId} configuration is present`,
    };
  }

  private ensureProvider(provider: string) {
    if (!this.providers[provider]) throw new NotFoundException(`Unknown provider: ${provider}`);
  }

  private maskSecret(value: string) {
    if (value.length <= 8) return '*'.repeat(value.length);
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  private liveValidationEnabled() {
    return this.config.get<string>('AI_PROVIDER_VALIDATION_MODE') === 'live';
  }

  private async validateProviderLive(provider: string, apiKey: string) {
    const startedAt = Date.now();
    const response = await this.callProvider(provider, apiKey);
    const elapsed_ms = Date.now() - startedAt;
    if (!response.ok) {
      throw new BadRequestException({
        valid: false,
        provider,
        mode: 'live-provider-validation',
        status_code: response.status,
        elapsed_ms,
        error: this.providerErrorMessage(provider, response.status),
      });
    }
    return {
      valid: true,
      provider,
      mode: 'live-provider-validation',
      status_code: response.status,
      elapsed_ms,
      message: `Successfully connected to ${this.providers[provider].name}`,
    };
  }

  private async callProvider(provider: string, apiKey: string) {
    const timeoutMs = Number(this.config.get<string>('AI_PROVIDER_VALIDATION_TIMEOUT_MS') ?? 10000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      if (provider === 'openai') {
        return await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        });
      }
      if (provider === 'claude') {
        return await fetch('https://api.anthropic.com/v1/models', {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          signal: controller.signal,
        });
      }
      if (provider === 'gemini') {
        return await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`, {
          method: 'GET',
          signal: controller.signal,
        });
      }
      if (provider === 'manus') {
        return await fetch('https://api.manus.ai/v1/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        });
      }
      throw new NotFoundException(`Unknown provider: ${provider}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private providerErrorMessage(provider: string, status: number) {
    return `Live validation failed for ${provider} with HTTP ${status}`;
  }

  private extractConfiguredSecret(config: Record<string, unknown>) {
    const value = config.key ?? config.api_key ?? config.token;
    return typeof value === 'string' ? value : undefined;
  }
}
