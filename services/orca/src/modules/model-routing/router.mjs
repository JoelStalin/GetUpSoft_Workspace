// M01 - Central Model Router & Capabilities Catalog
// Jerarquia deterministica: Reglas fijas -> LLM Local (Ollama) -> Proveedor externo gratuito -> Aprobacion humana

export class ModelRouter {
  constructor({ localAvailable = false, externalQuotaAvailable = true } = {}) {
    this.localAvailable = localAvailable;
    this.externalQuotaAvailable = externalQuotaAvailable;
    this.catalog = [
      { tier: 1, type: 'rules_engine', name: 'Deterministic Rules', cost: 0 },
      { tier: 2, type: 'local_llm', name: 'Ollama Qwen/Deepseek', cost: 0 },
      { tier: 3, type: 'external_llm', name: 'Gemini Flash Free Tier', cost: 0 },
      { tier: 4, type: 'human_fallback', name: 'Human Approval & Retry', cost: 0 }
    ];
  }

  routeTask({ taskType, complexity = 'simple', requiresExternal = false }) {
    // Si la tarea es puramente deterministica (p.ej. validacion, mapeo, regex)
    if (complexity === 'deterministic') {
      return { tier: 1, provider: 'rules_engine', reason: 'RULE_MATCH' };
    }

    // Si local esta disponible y no requiere capacidades externas forzadas
    if (this.localAvailable && !requiresExternal) {
      return { tier: 2, provider: 'local_llm', model: 'qwen2.5:7b', reason: 'LOCAL_PRIORITY' };
    }

    // Si hay cuota externa disponible
    if (this.externalQuotaAvailable) {
      return { tier: 3, provider: 'external_llm', model: 'gemini-1.5-flash', reason: 'EXTERNAL_FREE_TIER' };
    }

    // Fallback garantizado a revision humana
    return { tier: 4, provider: 'human_fallback', reason: 'QUOTA_EXHAUSTED_NEED_APPROVAL' };
  }
}
