import fs from 'node:fs';
import path from 'node:path';
import { askCouncil } from '../../apps/careerai/llm-council.mjs';

const runId = process.argv[2];
if (!/^run-[A-Za-z0-9-]+$/.test(runId || '')) process.exit(2);
const directory = path.resolve('data/careerai/delegations');
const target = path.join(directory, `${runId}.json`);
const temporary = `${target}.tmp`;
fs.mkdirSync(directory, { recursive: true });

const providers = ['nvidia', 'hermes', 'gemini', 'claude'];
const prompt = 'CareerAI runtime probe. Reply with exactly CAREERAI_READY and no explanation.';
const startedAt = new Date().toISOString();

const settled = await Promise.all(providers.map(async (provider) => {
  const started = Date.now();
  try {
    const result = await askCouncil(prompt, { providers: [provider] });
    const answer = result.answers?.find((item) => item.provider === provider);
    const failure = result.failed?.find((item) => item.provider === provider);
    return {
      provider,
      status: answer ? 'answered' : 'fallback_required',
      attempts: answer?.attempts || failure?.attempts || 1,
      duration_ms: Date.now() - started,
      transport_verified: Boolean(answer),
      error: failure?.error || null,
    };
  } catch (error) {
    return { provider, status: 'fallback_required', attempts: 1, duration_ms: Date.now() - started, transport_verified: false, error: String(error?.message || error) };
  }
}));

const artifact = {
  ok: true,
  run_id: runId,
  status: 'completed',
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  token_policy: 'one_short_probe_each',
  providers: settled,
  answered: settled.filter((item) => item.status === 'answered').map((item) => item.provider),
  fallback_required: settled.filter((item) => item.status !== 'answered').map((item) => item.provider),
  autocorrection: { evaluated: true, action: settled.some((item) => item.status !== 'answered') ? 'use_role_fallback_chain' : 'none' },
};
fs.writeFileSync(temporary, JSON.stringify(artifact, null, 2), { mode: 0o600 });
fs.renameSync(temporary, target);
