import fs from 'node:fs';
import assert from 'node:assert/strict';

const inventory = JSON.parse(fs.readFileSync('data/careerai/node-inventory.json', 'utf8'));
const parity = JSON.parse(fs.readFileSync('data/careerai/n8n-node-parity.json', 'utf8'));
assert.equal(parity.nodes.length, inventory.nodes.length);
assert.equal(new Set(parity.nodes.map((node) => node.node_id)).size, inventory.nodes.length);
for (const node of parity.nodes) {
  assert.ok(node.n8n_equivalent.type);
  assert.ok(/^https:\/\//.test(node.n8n_equivalent.source_url));
  assert.ok(node.configuration.properties.length >= 1);
  assert.ok(node.use_cases.length >= 2);
  assert.ok(node.functional_tests.length >= 3);
}
for (const id of ['whatsapp-summary', 'whatsapp-report-sender', 'whatsapp-approval-notification']) {
  const node = parity.nodes.find((item) => item.node_id === id);
  assert.ok(node.whatsapp_options.free_self_hosted);
  assert.ok(node.whatsapp_options.official);
}
console.log(JSON.stringify({ ok: true, node: 'n8n-parity-inventory', total: parity.nodes.length, whatsapp_dual_provider: true }));
