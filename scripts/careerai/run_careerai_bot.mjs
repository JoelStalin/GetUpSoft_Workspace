import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const fixturesPath = new URL('../data/careerai/fixtures.json', import.meta.url);
const auditPath = new URL('../data/careerai/audit.jsonl', import.meta.url);
const { schema_version: workflowVersion, fixtures } = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const startedAt = new Date().toISOString();
const results = [];
for (const fixture of fixtures) {
  const run = spawnSync(process.execPath, ['scripts/run_careerai_prepare_only.mjs', fixture.id], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  if (run.status !== 0) throw new Error(`CareerAI fixture failed: ${fixture.id}\n${run.stderr}`);
  results.push(JSON.parse(run.stdout.trim()));
}

const evidence = {
  event: 'careerai_bot_cycle',
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  workflow_version: workflowVersion,
  mode: 'prepare-only',
  fixtures: results.length,
  submit_performed: false,
  notifications_sent: false,
  statuses: results.map(({ fixture_id, expected_status, blocked_reasons }) => ({ fixture_id, expected_status, blocked_reasons })),
};

fs.appendFileSync(auditPath, `${JSON.stringify(evidence)}\n`);
console.log(JSON.stringify({ ok: true, ...evidence }));
