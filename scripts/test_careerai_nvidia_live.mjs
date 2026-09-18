import assert from 'node:assert/strict';
import { askRole, availableProviders, loadLocalEnv } from '../apps/careerai/llm-council.mjs';

loadLocalEnv();
loadLocalEnv('apps/orca');
const available = availableProviders();
assert.ok(available.includes('nvidia'), 'NVIDIA NIM debe estar configurado');

const preferred = process.env.NVIDIA_MODEL;
assert.equal(preferred, 'nvidia/nemotron-3.5-lightning-30b-a3b');
process.env.NVIDIA_MAX_TOKENS = '32';

const result = await askRole('heavy_lifting', 'Responde solamente: CAREERAI_NVIDIA_OK', { providers: ['nvidia'] });
if (!result.ok) console.error(JSON.stringify({ ok: result.ok, status: result.status, failed: result.failed }));
assert.equal(result.ok, true);
assert.equal(result.provider, 'nvidia');
assert.match(result.answers[0].text, /CAREERAI_NVIDIA_OK/i);
console.log(JSON.stringify({ ok: true, provider: result.provider, model: preferred, used_fallback: result.used_fallback, status: result.status }));
