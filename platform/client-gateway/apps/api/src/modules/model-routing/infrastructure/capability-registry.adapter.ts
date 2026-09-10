// M01 — catalogo de capacidades declaradas. Version inicial: proveedores conocidos hoy
// en este gateway (ver ai-automation/providers.service.ts) + Ollama local + CareerAI's
// LLM council (nvidia/hermes/gemini/openai/claude -- ver catalog-researcher, ya listo en
// el inventario de nodos de CareerAI). Disponibilidad se calcula por configuracion real
// presente (env var), nunca asumida como true.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CapabilityProvider } from '../domain/capability-provider.entity';

@Injectable()
export class CapabilityRegistryAdapter {
  constructor(private readonly config: ConfigService) {}

  private configured(envVar: string): boolean {
    return Boolean(this.config.get<string>(envVar));
  }

  list(): CapabilityProvider[] {
    return [
      {
        tier: 'local', providerId: 'ollama', capability: 'interpret_prompt',
        available: this.configured('OLLAMA_BASE_URL'),
        unavailableReason: this.configured('OLLAMA_BASE_URL') ? undefined : 'OLLAMA_BASE_URL no configurado',
      },
      {
        tier: 'external_free', providerId: 'nvidia', capability: 'interpret_prompt',
        available: this.configured('NVIDIA_API_KEY'),
        unavailableReason: this.configured('NVIDIA_API_KEY') ? undefined : 'NVIDIA_API_KEY no configurado',
      },
      {
        tier: 'external_free', providerId: 'gemini', capability: 'interpret_prompt',
        available: this.configured('GEMINI_API_KEY'),
        unavailableReason: this.configured('GEMINI_API_KEY') ? undefined : 'GEMINI_API_KEY no configurado',
      },
      {
        tier: 'external_paid', providerId: 'openai', capability: 'interpret_prompt',
        available: this.configured('OPENAI_API_KEY'),
        unavailableReason: this.configured('OPENAI_API_KEY') ? undefined : 'OPENAI_API_KEY no configurado',
      },
      {
        tier: 'external_paid', providerId: 'claude', capability: 'code_review',
        available: this.configured('ANTHROPIC_API_KEY'),
        unavailableReason: this.configured('ANTHROPIC_API_KEY') ? undefined : 'ANTHROPIC_API_KEY no configurado',
      },
    ];
  }
}
