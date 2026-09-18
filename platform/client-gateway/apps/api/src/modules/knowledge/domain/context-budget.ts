// K02 — compilador de contexto (funcion pura). Presupuesto de 8K tokens para el modelo
// local (seccion 3.8), reservando salida. Segmenta entradas grandes; NUNCA trunca
// instrucciones en silencio -- lo que no entra queda explicitamente fuera con su razon.
export interface RetrievedFragment {
  chunkId: string;
  sourceVersionId: string;
  text: string;
  relevance: number;
}

export interface ContextBudgetResult {
  includedFragments: RetrievedFragment[];
  excludedFragments: Array<{ fragment: RetrievedFragment; reason: string }>;
  totalTokensUsed: number;
  budgetTokens: number;
}

// Aproximacion honesta: no hay tokenizer real disponible en este modulo (el tokenizer
// exacto depende del modelo elegido, que decide el router de M01) -- se documenta la
// aproximacion en vez de fingir precision que no existe. ~4 caracteres por token es el
// estimador estandar para texto en ingles/espanol mixto.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function compileContext(
  fragments: RetrievedFragment[],
  { budgetTokens = 8000, reservedForOutputTokens = 1500 }: { budgetTokens?: number; reservedForOutputTokens?: number } = {},
): ContextBudgetResult {
  const availableTokens = budgetTokens - reservedForOutputTokens;
  const sorted = [...fragments].sort((a, b) => b.relevance - a.relevance);

  const included: RetrievedFragment[] = [];
  const excluded: Array<{ fragment: RetrievedFragment; reason: string }> = [];
  let used = 0;

  for (const fragment of sorted) {
    const cost = estimateTokens(fragment.text);
    if (used + cost <= availableTokens) {
      included.push(fragment);
      used += cost;
    } else {
      excluded.push({ fragment, reason: `presupuesto agotado: ${used}+${cost} tokens excederia el disponible (${availableTokens}, reservando ${reservedForOutputTokens} para salida)` });
    }
  }

  return { includedFragments: included, excludedFragments: excluded, totalTokensUsed: used, budgetTokens: availableTokens };
}
