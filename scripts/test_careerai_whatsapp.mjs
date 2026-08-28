import assert from 'node:assert/strict';
import { prepareWhatsAppMessage, sendWhatsAppMessage, idempotencyKey } from '../apps/orca/src/careerai/whatsapp.mjs';

const opportunity = { opportunity_id: 'op-1' };
const approval = { status: 'approved', opportunity_id: 'op-1', expires_at: new Date(Date.now() + 60000).toISOString() };

// Sin aprobacion no se prepara nada listo para enviar.
const sinAprobacion = prepareWhatsAppMessage({ opportunity, recipientPhone: '+15550001111', text: 'hola' });
assert.equal(sinAprobacion.ok, false);
assert.equal(sinAprobacion.blocked_at, 'approval');

// Numero fuera de la lista permitida se bloquea aunque la aprobacion sea valida.
const fueraDeLista = prepareWhatsAppMessage({
  opportunity, approval, recipientPhone: '+15550009999', text: 'hola',
  allowlistPhones: ['+15550001111'],
});
assert.equal(fueraDeLista.ok, false);
assert.equal(fueraDeLista.blocked_at, 'recipient');

// Con aprobacion vigente y numero permitido queda listo, pero send_performed sigue en false:
// preparar nunca envia.
const listo = prepareWhatsAppMessage({
  opportunity, approval, recipientPhone: '+1 (555) 000-1111', text: 'Hola, adjunto mi CV',
  allowlistPhones: ['+15550001111'],
});
assert.equal(listo.ok, true);
assert.equal(listo.status, 'ready_to_send');
assert.equal(listo.send_performed, false);
assert.equal(listo.idempotency_key, idempotencyKey({ opportunityId: 'op-1', payloadHash: listo.payload_hash }));

// Idempotencia: la misma clave ya vista no se reenvia.
const yaEnviado = prepareWhatsAppMessage({
  opportunity, approval, recipientPhone: '+1 (555) 000-1111', text: 'Hola, adjunto mi CV',
  allowlistPhones: ['+15550001111'], sentKeys: new Set([listo.idempotency_key]),
});
assert.equal(yaEnviado.status, 'already_sent');
assert.equal(yaEnviado.send_performed, false);

// Aunque este listo para enviar, sin confirm:true el envio real no ocurre.
const sinConfirmar = await sendWhatsAppMessage(listo, { baseUrl: 'http://fake', instance: 'x' });
assert.equal(sinConfirmar.ok, false);
assert.equal(sinConfirmar.send_performed, false);
assert.match(sinConfirmar.reason, /confirmacion explicita/);

// Sin baseUrl/instance configurados, tampoco se envia aunque haya confirm:true.
const sinConfig = await sendWhatsAppMessage(listo, { confirm: true, baseUrl: null, instance: null });
assert.equal(sinConfig.ok, false);
assert.equal(sinConfig.send_performed, false);

// Con todo en orden y un fetch simulado, el envio real ocurre y queda registrado.
let llamadas = [];
const fetchSimulado = async (url, options) => {
  llamadas.push({ url, body: options?.body ? JSON.parse(options.body) : null });
  if (url.includes('/chat/presence/')) return { ok: true, json: async () => ({}) };
  return { ok: true, json: async () => ({ key: { id: 'wamid.123' } }) };
};
const enviado = await sendWhatsAppMessage(listo, {
  confirm: true, baseUrl: 'http://fake-evolution', instance: 'careerai', apiKey: 'k', fetchImpl: fetchSimulado,
});
assert.equal(enviado.ok, true);
assert.equal(enviado.send_performed, true);
assert.equal(enviado.message_id, 'wamid.123');
// Simula presencia "escribiendo..." antes de enviar el texto (mitigacion de bloqueo Baileys).
assert.ok(llamadas.some((c) => c.url.includes('/chat/presence/')));
assert.ok(llamadas.some((c) => c.url.includes('/message/sendText/')));

console.log(JSON.stringify({
  ok: true,
  node: 'whatsapp-connector',
  bloquea_sin_aprobacion: true,
  bloquea_numero_no_permitido: true,
  preparar_nunca_envia: true,
  idempotente: true,
  exige_confirmacion_explicita: true,
  simula_presencia_antes_de_enviar: true,
}));
