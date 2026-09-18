import assert from 'node:assert/strict';
import { askRole, availableProviders, loadLocalEnv } from '../apps/careerai/llm-council.mjs';

loadLocalEnv();
assert.ok(availableProviders().includes('claude'));
const result = await askRole('code_review', 'Responde solamente: CAREERAI_CLAUDE_OK', { providers: ['claude'] });
assert.equal(result.ok, true);
assert.equal(result.provider, 'claude');
assert.match(result.answers[0].text, /CAREERAI_CLAUDE_OK/i);
console.log(JSON.stringify({ ok: true, provider: result.provider, transport: 'cli', status: result.status }));
