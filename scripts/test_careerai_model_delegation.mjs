import assert from 'node:assert/strict';
import { delegationSnapshot, loadLocalEnv } from '../apps/orca/src/careerai/llm-council.mjs';

loadLocalEnv();
loadLocalEnv('apps/orca');
const snapshot = delegationSnapshot();
for (const provider of ['nvidia', 'hermes', 'gemini', 'claude']) {
  assert.ok(snapshot.available.includes(provider), `${provider} debe tener transporte configurado`);
}
assert.equal(snapshot.roles.heavy_lifting.primary, 'nvidia');
// NVIDIA/Hermes (gratis) van primero en todos los roles; Claude queda como ultimo
// respaldo, no como titular, para no gastar llamadas de pago por defecto.
assert.equal(snapshot.roles.code_review.primary, 'nvidia');
assert.ok(snapshot.roles.code_review.fallback.includes('claude'));
assert.equal(snapshot.roles.qa_testing.primary, 'nvidia');
assert.ok(snapshot.roles.qa_testing.fallback.includes('gemini'));
assert.equal(snapshot.roles.research.primary, 'hermes');
assert.equal(snapshot.token_policy.strategy, 'primary_then_fallback');
assert.equal(snapshot.token_policy.max_attempts_per_provider, 1);
console.log(JSON.stringify(snapshot));
