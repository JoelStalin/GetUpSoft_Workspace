import assert from 'node:assert/strict';
import { askRole, availableProviders, loadLocalEnv } from '../apps/careerai/llm-council.mjs';

loadLocalEnv();
loadLocalEnv('apps/orca');
assert.ok(availableProviders().includes('gemini'));
const result = await askRole('heavy_lifting', 'Responde solamente: CAREERAI_GEMINI_OK', { providers: ['gemini'] });
assert.equal(result.ok, true);
assert.equal(result.provider, 'gemini');
assert.match(result.answers[0].text, /CAREERAI_GEMINI_OK/i);
console.log(JSON.stringify({ ok: true, provider: result.provider, used_fallback: result.used_fallback, status: result.status }));
