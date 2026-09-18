import { compileContext, estimateTokens } from './context-budget';

function fragment(id: string, chars: number, relevance: number) {
  return { chunkId: id, sourceVersionId: `sv-${id}`, text: 'x'.repeat(chars), relevance };
}

describe('compileContext', () => {
  it('respeta el presupuesto: no incluye fragmentos que lo excedan', () => {
    // budget default 8000 - 1500 reservado = 6500 disponibles. Cada fragmento de 20000
    // caracteres ~ 5000 tokens -- solo caben 1 de 3.
    const fragments = [fragment('a', 20000, 0.9), fragment('b', 20000, 0.8), fragment('c', 20000, 0.7)];
    const result = compileContext(fragments);
    expect(result.includedFragments.length).toBe(1);
    expect(result.includedFragments[0].chunkId).toBe('a');
    expect(result.excludedFragments.length).toBe(2);
    expect(result.totalTokensUsed).toBeLessThanOrEqual(result.budgetTokens);
  });

  it('prioriza por relevancia, no por orden de entrada', () => {
    const fragments = [fragment('bajo', 100, 0.1), fragment('alto', 100, 0.9), fragment('medio', 100, 0.5)];
    const result = compileContext(fragments);
    expect(result.includedFragments.map((f) => f.chunkId)).toEqual(['alto', 'medio', 'bajo']);
  });

  it('un fragmento excluido tiene una razon explicita, nunca se descarta en silencio', () => {
    const fragments = [fragment('grande', 40000, 0.9)];
    const result = compileContext(fragments, { budgetTokens: 100, reservedForOutputTokens: 50 });
    expect(result.includedFragments.length).toBe(0);
    expect(result.excludedFragments.length).toBe(1);
    expect(result.excludedFragments[0].reason).toContain('presupuesto agotado');
  });

  it('estimateTokens es una aproximacion documentada (4 caracteres por token)', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('a'.repeat(400))).toBe(100);
  });

  it('sin fragmentos, no falla -- devuelve listas vacias', () => {
    const result = compileContext([]);
    expect(result.includedFragments).toEqual([]);
    expect(result.excludedFragments).toEqual([]);
    expect(result.totalTokensUsed).toBe(0);
  });
});
