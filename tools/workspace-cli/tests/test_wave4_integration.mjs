import assert from 'node:assert/strict';
import { KnowledgeIngestionService } from '../../../platform/orca/src/modules/knowledge/ingestion.mjs';
import { ModelRouter } from '../../../platform/orca/src/modules/model-routing/router.mjs';
import { GatewayPairingService } from '../../../platform/client-gateway/src/pairing/pairing-service.mjs';

// Test K01: Knowledge Ingestion
const ingestion = new KnowledgeIngestionService();
const doc1 = ingestion.ingestDocument({
  sourceId: 'src-1',
  title: 'Guia DGII Facturacion',
  content: 'Contenido oficial de e-NCF para la DGII de Republica Dominicana.',
  classification: 'internal'
});
assert.equal(doc1.ok, true);
assert.equal(doc1.deduplicated, false);

// Deduplicacion exacta por hash
const doc2 = ingestion.ingestDocument({
  sourceId: 'src-2',
  title: 'Copia Identica',
  content: 'Contenido oficial de e-NCF para la DGII de Republica Dominicana.',
  classification: 'internal'
});
assert.equal(doc2.deduplicated, true);
assert.equal(doc2.contentHash, doc1.contentHash);

// Test M01: Model Routing Tiering
const router = new ModelRouter({ localAvailable: true, externalQuotaAvailable: true });
const r1 = router.routeTask({ taskType: 'parse', complexity: 'deterministic' });
assert.equal(r1.tier, 1);
assert.equal(r1.provider, 'rules_engine');

const r2 = router.routeTask({ taskType: 'extract', complexity: 'medium' });
assert.equal(r2.tier, 2);
assert.equal(r2.provider, 'local_llm');

const routerNoLocal = new ModelRouter({ localAvailable: false, externalQuotaAvailable: true });
const r3 = routerNoLocal.routeTask({ taskType: 'summarize', complexity: 'high' });
assert.equal(r3.tier, 3);
assert.equal(r3.provider, 'external_llm');

const routerExhausted = new ModelRouter({ localAvailable: false, externalQuotaAvailable: false });
const r4 = routerExhausted.routeTask({ taskType: 'complex', complexity: 'high' });
assert.equal(r4.tier, 4);
assert.equal(r4.provider, 'human_fallback');

// Test F01: Gateway Pairing & Single-Use
const gateway = new GatewayPairingService();
const pairCode = gateway.generatePairingCode({ organizationId: 'org-1', deviceId: 'dev-001' });
assert.ok(pairCode);

const consumed = gateway.consumePairingCode(pairCode);
assert.equal(consumed.ok, true);
assert.equal(consumed.deviceId, 'dev-001');

// No se puede volver a consumir el mismo codigo
assert.throws(() => {
  gateway.consumePairingCode(pairCode);
}, /single-use constraint/);

// Verificacion de token y revocacion
const tokenCheck = gateway.verifyDeviceToken(consumed.deviceToken);
assert.equal(tokenCheck.valid, true);
assert.equal(tokenCheck.deviceId, 'dev-001');

gateway.revokeDeviceToken(consumed.deviceToken);
const tokenCheckAfterRevoke = gateway.verifyDeviceToken(consumed.deviceToken);
assert.equal(tokenCheckAfterRevoke.valid, false);

console.log(JSON.stringify({
  ok: true,
  wave: 4,
  tasks: ['K01', 'M01', 'F01'],
  knowledge_ingestion_hash_dedup_verified: true,
  model_routing_tiering_verified: true,
  gateway_pairing_single_use_verified: true
}));
