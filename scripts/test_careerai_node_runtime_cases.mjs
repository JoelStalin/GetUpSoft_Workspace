import assert from 'node:assert/strict';
import fs from 'node:fs';
import { executeNodeFamily, nodeFamily } from '../apps/orca/src/runtime/node-family-executor.mjs';

const parity = JSON.parse(fs.readFileSync('data/careerai/n8n-node-parity.json', 'utf8'));
const calls = [];
const results = [];
const adapters = Object.fromEntries(['http','rss','data','browser','ai','gmail','whatsapp'].map((family) => [family, async (request) => {
  calls.push(request);
  if (family === 'browser') return { session_alive: true, action: 'inspect_fixture_page', user_setup_required: false };
  if (family === 'ai') return { text: 'fixture model response', usage: { input_tokens: 4, output_tokens: 3 } };
  if (family === 'whatsapp' || family === 'gmail') return { draft_id: `fixture-${request.node_id}`, sent: false };
  if (family === 'data') return { row: { id: request.node_id }, operation: request.config.operation };
  if (family === 'rss') return { items: [{ title: 'Fixture job', url: 'https://fixture.invalid/job/1' }] };
  return { status: 200, body: { fixture: true } };
}]));

const counts = {};
for (const entry of parity.nodes) {
  const family = nodeFamily(entry); counts[family] = (counts[family] || 0) + 1;
  const defaults = Object.fromEntries(entry.configuration.properties.map((property) => [property.name, structuredClone(property.default)]));
  const config = { ...defaults };
  if (family === 'code') config.jsCode = 'return items.map(item => ({ json: { ...item.json, executedBy: "orca" } }));';
  if (family === 'decision') config.predicate = (item) => item.score >= 70;
  if (family === 'http' || family === 'rss') config.url = 'https://fixture.invalid/resource';
  if (family === 'data') config.table = 'fixture_table';
  if (family === 'browser') Object.assign(config, { sessionId: 'fixture-session', target: 'https://fixture.invalid/form' });
  if (family === 'ai') Object.assign(config, { credential: 'fixture-credential-ref', prompt: 'Review fixture input' });
  if (family === 'gmail') Object.assign(config, { credential: 'fixture-gmail-ref', to: 'fixture@example.invalid', message: 'Fixture draft' });
  if (family === 'whatsapp') Object.assign(config, { credential: 'fixture-whatsapp-ref', to: '+10000000000', message: 'Fixture approval draft' });

  const beforeHappy = calls.length;
  const happy = await executeNodeFamily(entry, config, { score: 85, title: 'Fixture' }, adapters);
  assert.equal(happy.ok, true, `${entry.node_id} happy path`);
  assert.notEqual(happy.status, 'configuration_required', `${entry.node_id} configured`);
  const external = ['http','rss','data','browser','ai','gmail','whatsapp'].includes(family);
  assert.equal(calls.length - beforeHappy, external ? 1 : 0, `${entry.node_id} adapter invocation`);

  const beforeInvalid = calls.length;
  const invalid = await executeNodeFamily(entry, {}, { score: 0 }, adapters);
  assert.equal(invalid.ok, false, `${entry.node_id} invalid path rejects`);
  assert.equal(invalid.side_effect, false, `${entry.node_id} invalid path side effect`);
  assert.equal(calls.length, beforeInvalid, `${entry.node_id} invalid path must not invoke adapter`);
  results.push({ node_id: entry.node_id, family, happy_path: { status: happy.status, adapter_invoked: calls.length > beforeHappy }, invalid_or_expired_input: { status: invalid.status, error: invalid.error, adapter_invoked: false, side_effect: false } });
}

assert.equal(Object.values(counts).reduce((sum, value) => sum + value, 0), 100);
assert.ok(counts.whatsapp === 3 && counts.browser >= 1 && counts.ai >= 1 && counts.code >= 1);
fs.writeFileSync('data/careerai/node-functional-test-report.json', `${JSON.stringify({ schema_version: 'careerai.node-functional-tests.v1', generated_at: new Date().toISOString(), total_nodes: parity.nodes.length, executable_cases: parity.nodes.length * 2, adapter_calls: calls.length, families: counts, results }, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, nodes: parity.nodes.length, executable_cases: parity.nodes.length * 2, adapter_calls: calls.length, families: counts }));
