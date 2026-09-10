// A02 — dominio: sin imports de NestJS, Prisma, Docker ni SDK de modelos (regla del
// diseno GetUpSoft+ORCA). Forma pura del resultado de interpretar un prompt.
export interface InterpretationOutput {
  source_type: string;
  detected_intent: string;
  selected_skill: string;
  normalized_prompt: string;
  scrum: { tasks: string[]; risks: string[]; dependencies: string[] };
  model_prompt: {
    paid_model_prompt: string;
    free_model_followup_prompt: string;
    error_recovery_prompt: string;
  };
  // Campos opcionales presentes en la respuesta del adapter mock (paridad exacta con el
  // shape original de mockInterpretation()) pero no garantizados por el adapter Python.
  original_input?: string;
  canonical_language?: string;
  confidence?: number;
}

export function isInterpretationOutput(value: unknown): value is InterpretationOutput {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.source_type === 'string' && typeof payload.scrum === 'object' && typeof payload.model_prompt === 'object';
}
