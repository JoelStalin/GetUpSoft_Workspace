// Conector de WhatsApp via la Cloud API OFICIAL de Meta (Graph API). Alternativa a
// whatsapp.mjs (Evolution API / Baileys, no oficial): esta via no tiene riesgo de baneo
// porque es el camino sancionado por Meta, y ya hay credenciales oficiales provisionadas
// en .env.local (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID).
//
// Investigacion que respalda esta decision (2026-08-28):
// - La Cloud API NO soporta grupos de forma alcanzable para este caso: existe una Groups API
//   real, pero requiere "Official Business Account" (OBA), que exige notabilidad de marca
//   (cobertura de prensa, ser una marca ya buscada) — inalcanzable para este agente. En su
//   lugar: mensaje 1-a-1 al cliente + notificacion 1-a-1 aparte al admin (mismo resultado
//   de "los dos enterados", sin depender de OBA).
// - Conversaciones de servicio (iniciadas por el destinatario, dentro de la ventana de 24h)
//   son gratis e ilimitadas hoy. Ese beneficio cambia el 2026-10-01: a partir de esa fecha
//   las respuestas dentro de la ventana empiezan a cobrarse (a tarifas bajas). No afecta el
//   arranque de esta semana.
// - Explicitamente NO se implementa aqui el envio via Baileys/Evolution API (ver
//   whatsapp.mjs): esa via viola los Terminos de Servicio de WhatsApp y tiene riesgo real y
//   documentado de baneo del numero (deteccion tipica en 2-8 semanas segun investigacion
//   2026), sin aviso previo. Se deja intacta como alternativa, no como default.
//
// Inerte por diseno: nada de este modulo se invoca desde ningun flujo automatico. Se activa
// solo si el llamador pasa transport: 'cloud_api' explicitamente Y confirm: true para el
// envio real. Mismo patron guard que whatsapp.mjs y senders.mjs: preparar nunca envia.
import crypto from 'node:crypto';
import { checkApproval } from './guards.mjs';

const GRAPH_API_VERSION = 'v25.0';

function payloadHashOf(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function guardResult(stage, reason, extra = {}) {
  return { ok: false, status: 'blocked', blocked_at: stage, reason, send_performed: false, ...extra };
}

export function idempotencyKey({ opportunityId, payloadHash }) {
  return crypto.createHash('sha256').update(`whatsapp-cloud-api|${opportunityId}|${payloadHash}`).digest('hex');
}

// --- prepara el mensaje, nunca lo envia ----------------------------------------
// Mismo contrato que prepareWhatsAppMessage en whatsapp.mjs, para que el llamador pueda
// elegir el transporte sin cambiar el resto del flujo de aprobacion.
export function prepareCloudApiMessage({
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

  // Mismo motivo que en whatsapp.mjs: un mensaje al numero equivocado expone datos
  // personales del cliente y no se puede retirar de WhatsApp.
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
    transport: 'cloud_api',
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

// --- estado de la configuracion (solo lectura, sin credenciales embebidas) ----
export async function cloudApiStatus({
  accessToken = process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID,
  fetchImpl = fetch,
} = {}) {
  if (!accessToken || !phoneNumberId) {
    return { ok: false, configured: false, reason: 'faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID' };
  }
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name,code_verification_status,is_official_business_account`;
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) return { ok: false, configured: true, reason: `HTTP ${response.status}` };
    const data = await response.json();
    return {
      ok: true,
      configured: true,
      display_phone_number: data.display_phone_number || null,
      verified_name: data.verified_name || null,
      code_verification_status: data.code_verification_status || null,
      is_official_business_account: data.is_official_business_account === true,
      // Si esto es false y el numero tiene prefijo 555, es probable que sea el numero de
      // prueba que Meta asigna en el Quick Start: sirve para probar, no para produccion real
      // (limitado a destinatarios pre-verificados en la consola de Meta).
      likely_test_number: /^\+?1\s?555/.test(String(data.display_phone_number || '')),
    };
  } catch (error) {
    return { ok: false, configured: true, reason: String(error?.message || error) };
  }
}

// --- envio real: exige aprobacion + confirmacion explicita + credenciales -------
export async function sendCloudApiMessage(prepared, {
  confirm = false,
  accessToken = process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID,
  fetchImpl = fetch,
} = {}) {
  if (!prepared?.ok || prepared.status !== 'ready_to_send') {
    return { ok: false, send_performed: false, reason: 'nada preparado y listo para enviar', prepared };
  }
  // Segunda puerta, independiente de la aprobacion de negocio: quien ejecuta el envio real
  // tiene que pasarlo explicitamente, nunca un default.
  if (confirm !== true) {
    return { ok: false, send_performed: false, reason: 'falta confirmacion explicita (confirm: true) para el envio real' };
  }
  if (!accessToken || !phoneNumberId) {
    return { ok: false, send_performed: false, reason: 'sin WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID configurados' };
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual', // deliberado: sin soporte de grupo, ver nota de OBA arriba
        to: prepared.recipient_phone,
        type: 'text',
        text: { preview_url: false, body: prepared.text },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, send_performed: false, reason: data?.error?.message || `HTTP ${response.status}`, raw: data };
    }
    return {
      ok: true,
      send_performed: true,
      opportunity_id: prepared.opportunity_id,
      idempotency_key: prepared.idempotency_key,
      approval_id: prepared.approval_id,
      message_id: data?.messages?.[0]?.id || null,
      raw: data,
    };
  } catch (error) {
    return { ok: false, send_performed: false, reason: String(error?.message || error) };
  }
}
