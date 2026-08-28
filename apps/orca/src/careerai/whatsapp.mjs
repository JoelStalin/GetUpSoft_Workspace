// Conector de WhatsApp via Evolution API (self-hosted, Baileys o WhatsApp Cloud API oficial).
// Se elige Evolution API porque es gratis, de codigo abierto y evita depender de la
// automatizacion fragil sobre el navegador de web.whatsapp.com que usaba el prototipo.
//
// Mismo patron que senders.mjs: preparar nunca envia. El envio real vive en una funcion
// aparte que exige aprobacion vigente POR oportunidad y una confirmacion explicita del
// llamador (confirm: true), asi el "click de enviar" nunca queda implicito en un flujo
// automatico.
import crypto from 'node:crypto';
import { checkApproval } from './guards.mjs';

function payloadHashOf(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function guardResult(stage, reason, extra = {}) {
  return { ok: false, status: 'blocked', blocked_at: stage, reason, send_performed: false, ...extra };
}

export function idempotencyKey({ opportunityId, payloadHash }) {
  return crypto.createHash('sha256').update(`whatsapp|${opportunityId}|${payloadHash}`).digest('hex');
}

// --- whatsapp-connector: prepara el mensaje, nunca lo envia --------------------
export function prepareWhatsAppMessage({
  opportunity,
  approval,
  recipientPhone,
  text,
  allowlistPhones = [],
  sentKeys = new Set(),
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return guardResult('input', 'falta opportunity_id');
  if (!recipientPhone) return guardResult('input', 'no hay numero destino: sin numero no hay nada que enviar');
  if (!text) return guardResult('input', 'falta el texto del mensaje');

  const phone = String(recipientPhone).replace(/[^\d+]/g, '');
  const payload = { opportunity_id: opportunity.opportunity_id, phone, text };
  const hash = payloadHashOf(payload);

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, payload, now });
  if (!approvalCheck.valid) return guardResult('approval', 'aprobacion no valida', { approval_reasons: approvalCheck.reasons });

  // El numero destino debe estar en la lista permitida: un mensaje al numero equivocado
  // expone datos personales del cliente y no se puede retirar de WhatsApp.
  if (allowlistPhones.length && !allowlistPhones.map((p) => p.replace(/[^\d+]/g, '')).includes(phone)) {
    return guardResult('recipient', `numero ${phone} fuera de la lista permitida`);
  }

  const key = idempotencyKey({ opportunityId: opportunity.opportunity_id, payloadHash: hash });
  if (sentKeys.has(key)) {
    return { ok: true, status: 'already_sent', reason: 'ya se envio este mensaje para esta oportunidad',
      idempotency_key: key, send_performed: false };
  }

  return {
    ok: true,
    status: 'ready_to_send',
    channel: 'whatsapp',
    opportunity_id: opportunity.opportunity_id,
    recipient_phone: phone,
    text,
    idempotency_key: key,
    payload_hash: hash,
    approval_id: approval?.approval_id || null,
    send_performed: false,
  };
}

// --- estado de la instancia (solo lectura, sin credenciales embebidas) ---------
export async function evolutionInstanceStatus({ baseUrl = process.env.EVOLUTION_API_BASE_URL, apiKey = process.env.EVOLUTION_API_KEY, instance = process.env.EVOLUTION_API_INSTANCE } = {}) {
  if (!baseUrl || !instance) return { ok: false, connected: false, reason: 'sin EVOLUTION_API_BASE_URL o EVOLUTION_API_INSTANCE configurados' };
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/instance/connectionState/${instance}`, {
      headers: apiKey ? { apikey: apiKey } : {},
    });
    if (!response.ok) return { ok: false, connected: false, reason: `HTTP ${response.status}` };
    const data = await response.json();
    return { ok: true, connected: data?.instance?.state === 'open', raw_state: data?.instance?.state || null };
  } catch (error) {
    return { ok: false, connected: false, reason: String(error?.message || error) };
  }
}

const randomDelayMs = (min = 1200, max = 3500) => Math.floor(min + Math.random() * (max - min));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- envio real: exige aprobacion + confirmacion explicita + instancia conectada ---
// La demora aleatoria y el estado "escribiendo..." siguen la recomendacion de la
// investigacion (documento de arquitectura) para no disparar el bloqueo de cuenta de
// Baileys por enviar como robot.
export async function sendWhatsAppMessage(prepared, {
  confirm = false,
  baseUrl = process.env.EVOLUTION_API_BASE_URL,
  apiKey = process.env.EVOLUTION_API_KEY,
  instance = process.env.EVOLUTION_API_INSTANCE,
  fetchImpl = fetch,
} = {}) {
  if (!prepared?.ok || prepared.status !== 'ready_to_send') {
    return { ok: false, send_performed: false, reason: 'nada preparado y listo para enviar', prepared };
  }
  // Segunda puerta, independiente de la aprobacion de negocio: quien ejecuta el envio
  // real tiene que pasarlo explicitamente, nunca un default.
  if (confirm !== true) {
    return { ok: false, send_performed: false, reason: 'falta confirmacion explicita (confirm: true) para el envio real' };
  }
  if (!baseUrl || !instance) {
    return { ok: false, send_performed: false, reason: 'sin EVOLUTION_API_BASE_URL o EVOLUTION_API_INSTANCE configurados' };
  }

  const url = `${baseUrl.replace(/\/$/, '')}/message/sendText/${instance}`;
  const headers = { 'content-type': 'application/json', ...(apiKey ? { apikey: apiKey } : {}) };

  try {
    // Simula presencia humana antes de enviar (mitigacion de bloqueo recomendada para Baileys).
    await fetchImpl(`${baseUrl.replace(/\/$/, '')}/chat/presence/${instance}`, {
      method: 'POST', headers, body: JSON.stringify({ number: prepared.recipient_phone, presence: 'composing' }),
    }).catch(() => {});
    await wait(randomDelayMs());

    const response = await fetchImpl(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ number: prepared.recipient_phone, text: prepared.text }),
    });
    if (!response.ok) return { ok: false, send_performed: false, reason: `HTTP ${response.status}` };
    const data = await response.json();
    return {
      ok: true,
      send_performed: true,
      opportunity_id: prepared.opportunity_id,
      idempotency_key: prepared.idempotency_key,
      approval_id: prepared.approval_id,
      message_id: data?.key?.id || null,
      raw: data,
    };
  } catch (error) {
    return { ok: false, send_performed: false, reason: String(error?.message || error) };
  }
}
