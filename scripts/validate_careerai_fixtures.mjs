import fs from 'node:fs';

const file = new URL('../data/careerai/fixtures.json', import.meta.url);
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const required = new Set([
  'indeed-remote-valid',
  'indeed-remote-unknown',
  'provider-consensus',
  'provider-disagreement',
  'approval-expired-or-duplicate',
  'login-captcha-mfa',
  'idempotent-retry',
  'process-restart-resume',
]);
const actual = new Set(document.fixtures.map((fixture) => fixture.id));
const missing = [...required].filter((id) => !actual.has(id));
if (missing.length) throw new Error(`Missing CareerAI fixtures: ${missing.join(', ')}`);

const valid = document.fixtures.find((fixture) => fixture.id === 'indeed-remote-valid');
if (valid.opportunity.remote_verified !== true || valid.expected_status !== 'ready_for_review') {
  throw new Error('Valid Indeed remote fixture contract failed');
}
const unknown = document.fixtures.find((fixture) => fixture.id === 'indeed-remote-unknown');
if (unknown.opportunity.remote_verified !== false || unknown.expected_status !== 'needs_review') {
  throw new Error('Unknown remote fixture must remain needs_review');
}
const disagreement = document.fixtures.find((fixture) => fixture.id === 'provider-disagreement');
if (new Set(disagreement.analyses.map((analysis) => analysis.recommendation)).size < 2 || disagreement.expected_status !== 'consensus_blocked') {
  throw new Error('Provider disagreement must block consensus');
}
const retry = document.fixtures.find((fixture) => fixture.id === 'idempotent-retry');
if (new Set(retry.notifications.map((notification) => notification.idempotency_key)).size !== 1 || retry.expected_status !== 'duplicate_suppressed') {
  throw new Error('Retry fixture must suppress duplicate delivery');
}
const restart = document.fixtures.find((fixture) => fixture.id === 'process-restart-resume');
if (
  restart.expected_status !== 'resumed_from_checkpoint' ||
  restart.restart?.active_node !== 'human-approval' ||
  restart.restart?.checkpoint !== 'approval-created' ||
  restart.restart?.ledger_status !== 'in_progress' ||
  restart.restart?.memory_refs?.length < 1 ||
  restart.restart?.evidence_refs?.length < 1
) {
  throw new Error('Restart fixture must restore checkpoint, active node, memory, ledger, and evidence');
}
console.log(JSON.stringify({ ok: true, schema_version: document.schema_version, fixtures: document.fixtures.length, required: required.size }));
