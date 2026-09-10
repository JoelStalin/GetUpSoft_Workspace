import assert from 'node:assert/strict';
import fs from 'node:fs';
import { OutboxService } from '../../../platform/orca/src/modules/outbox/outbox-service.mjs';
import { HybridSearchService } from '../../../platform/orca/src/modules/knowledge/hybrid-search.mjs';
import { BudgetReservationService } from '../../../platform/orca/src/modules/budget/reservation.mjs';

// Test B04: Profiles exist
assert.ok(fs.existsSync('tools/workspace-cli/profiles/orca-local.json'));
assert.ok(fs.existsSync('tools/workspace-cli/profiles/galantes-local.json'));
assert.ok(fs.existsSync('tools/workspace-cli/profiles/chefalitas-local.json'));

// Test E01: Outbox Idempotency
const outbox = new OutboxService();
const m1 = outbox.publish({ topic: 'candidate.match', payload: { id: 1 }, idempotencyKey: 'idemp-001' });
assert.equal(m1.deduplicated, false);
const m2 = outbox.publish({ topic: 'candidate.match', payload: { id: 1 }, idempotencyKey: 'idemp-001' });
assert.equal(m2.deduplicated, true);
const batchRes = outbox.processBatch();
assert.equal(batchRes.processedCount, 1);

// Test K02: Hybrid Search & Token Budget
const searcher = new HybridSearchService({ tokenBudget: 200 });
searcher.addDocument({ id: 'doc-1', title: 'Odoo ERP Setup', content: 'Instalacion y configuracion del sistema Odoo 16 con PostgreSQL.' });
searcher.addDocument({ id: 'doc-2', title: 'React Frontend', content: 'Desarrollo de componentes React con TailwindCSS para Next.js.' });
const res = searcher.search('Odoo');
assert.equal(res.count, 1);
assert.equal(res.results[0].id, 'doc-1');
assert.ok(res.estimatedTokens <= 200);

// Test M02: Budget Reservation
const budget = new BudgetReservationService();
budget.initTenant('tenant-free', 'free');
assert.throws(() => {
  budget.reserveBudget('tenant-free', 1.50);
}, /Presupuesto insuficiente/);

budget.initTenant('tenant-starter', 'starter');
const bRes = budget.reserveBudget('tenant-starter', 2.00);
assert.equal(bRes.ok, true);
assert.equal(bRes.remaining, 8.00);

console.log(JSON.stringify({
  ok: true,
  wave: 5,
  tasks: ['B04', 'E01', 'K02', 'M02'],
  profiles_verified: true,
  outbox_idempotency_verified: true,
  search_budget_verified: true,
  budget_reservation_verified: true
}));
