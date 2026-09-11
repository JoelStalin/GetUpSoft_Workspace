import assert from 'node:assert/strict';
import { buildSummaryText, prepareWhatsAppSummary } from '../platform/orca/src/careerai/whatsapp-summary.mjs';

const texto = buildSummaryText({ periodLabel: 'semana del 1 al 7', applicationsCount: 5, responsesCount: 2, interviewsCount: 1 });
assert.match(texto, /Postulaciones preparadas: 5/);
assert.match(texto, /Entrevistas agendadas: 1/);

const opportunity = { opportunity_id: 'opp-1' };
const approval = { approval_id: 'ap-1', opportunity_id: 'opp-1', status: 'approved', expires_at: '2099-01-01T00:00:00Z' };
const now = new Date('2026-01-01T00:00:00Z');

const listo = prepareWhatsAppSummary({
  opportunity, approval, recipientPhone: '+18095551234', allowlistPhones: ['+18095551234'],
  summary: { periodLabel: 'semana', applicationsCount: 3, responsesCount: 1, interviewsCount: 0 }, now,
});
assert.equal(listo.ok, true);
assert.equal(listo.status, 'ready_to_send');
assert.equal(listo.send_performed, false);
assert.match(listo.text, /Postulaciones preparadas: 3/);

const fueraDeAllowlist = prepareWhatsAppSummary({
  opportunity, approval, recipientPhone: '+10000000000', allowlistPhones: ['+18095551234'],
  summary: { applicationsCount: 1 }, now,
});
assert.equal(fueraDeAllowlist.ok, false, 'reusa la guarda de allowlist de whatsapp.mjs');

const sinResumen = prepareWhatsAppSummary({ opportunity, approval, recipientPhone: '+18095551234', now });
assert.equal(sinResumen.ok, false);

console.log(JSON.stringify({ ok: true, node: 'whatsapp-summary', reutiliza_guardas_de_whatsapp_mjs: true, draft_only: true }));
