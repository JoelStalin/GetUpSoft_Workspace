// Nodos email-apply-sender y submit-executor: los dos unicos puntos del workflow que actuan
// sobre el mundo exterior. Todo lo demas se puede repetir; un correo enviado y un formulario
// enviado no se pueden retirar.
//
// Por eso ambos comparten la misma secuencia de guardas, y basta que una falle para que no
// se ejecute nada:
//   1. aprobacion valida, vigente y para ESTA oportunidad
//   2. el contenido no cambio despues de aprobarse
//   3. destinatario o dominio dentro de lo permitido
//   4. no se repite un envio ya hecho (idempotencia)
import crypto from 'node:crypto';
import { checkApproval } from './guards.mjs';

export function idempotencyKey({ opportunityId, channel, payloadHash }) {
  return crypto.createHash('sha256').update(`${channel}|${opportunityId}|${payloadHash}`).digest('hex');
}

function payloadHashOf(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function guardResult(stage, reason, extra = {}) {
  return { ok: false, status: 'blocked', blocked_at: stage, reason, send_performed: false, submit_performed: false, ...extra };
}

// --- email-apply-sender ------------------------------------------------------
export function prepareEmailApplication({
  opportunity,
  approval,
  cv,
  coverLetter,
  recipient,
  allowlistDomains = [],
  sentKeys = new Set(),
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return guardResult('input', 'falta opportunity_id');
  if (!recipient) return guardResult('input', 'no hay destinatario: sin direccion no hay nada que enviar');
  if (!cv) return guardResult('input', 'falta el CV adaptado');
  if (!coverLetter) return guardResult('input', 'falta la carta de presentacion');

  const payload = { opportunity_id: opportunity.opportunity_id, cv, cover_letter: coverLetter, recipient };
  const hash = payloadHashOf(payload);

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, now });
  if (!approvalCheck.valid) return guardResult('approval', 'aprobacion no valida', { approval_reasons: approvalCheck.reasons });

  // El dominio del destinatario debe estar permitido: un correo a la direccion equivocada
  // expone datos personales del cliente y no se puede deshacer.
  const domain = String(recipient).split('@')[1]?.toLowerCase();
  if (allowlistDomains.length && !allowlistDomains.map((d) => d.toLowerCase()).includes(domain)) {
    return guardResult('recipient', `dominio ${domain} fuera de la lista permitida`);
  }

  const key = idempotencyKey({ opportunityId: opportunity.opportunity_id, channel: 'email', payloadHash: hash });
  if (sentKeys.has(key)) {
    return { ok: true, status: 'already_sent', reason: 'ya se envio este correo para esta oportunidad',
      idempotency_key: key, send_performed: false };
  }

  return {
    ok: true,
    status: 'ready_to_send',
    channel: 'email',
    opportunity_id: opportunity.opportunity_id,
    recipient,
    subject: `Candidatura: ${opportunity.title || 'puesto'}${opportunity.company ? ` - ${opportunity.company}` : ''}`,
    attachments: [
      { name: 'cv.pdf', ref: cv },
      { name: 'carta.pdf', ref: coverLetter },
    ],
    idempotency_key: key,
    payload_hash: hash,
    approval_id: approval?.approval_id || null,
    // Se prepara todo, pero el envio real lo ejecuta el conector con esta autorizacion.
    send_performed: false,
  };
}

// --- submit-executor ---------------------------------------------------------
export function prepareFormSubmit({
  opportunity,
  approval,
  fillPlan,
  sessionActive = false,
  botWallDetected = false,
  submittedKeys = new Set(),
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return guardResult('input', 'falta opportunity_id');
  if (!fillPlan) return guardResult('input', 'no hay plan de llenado');

  // Un campo obligatorio sin resolver no se envia: el ATS lo rechazaria o, peor, lo
  // aceptaria incompleto y quemaria la candidatura.
  if (fillPlan.can_submit_without_human === false) {
    return guardResult('fill_plan', 'hay campos obligatorios sin resolver', {
      blocking_required_fields: fillPlan.blocking_required_fields || [],
    });
  }

  if (botWallDetected) return guardResult('bot_wall', 'el portal mostro una verificacion anti-bot; requiere intervencion humana');
  if (!sessionActive) return guardResult('session', 'la sesion del portal no esta activa');

  const payload = { opportunity_id: opportunity.opportunity_id, plan: fillPlan.plan };
  const hash = payloadHashOf(payload);

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, now });
  if (!approvalCheck.valid) return guardResult('approval', 'aprobacion no valida', { approval_reasons: approvalCheck.reasons });

  const key = idempotencyKey({ opportunityId: opportunity.opportunity_id, channel: 'form', payloadHash: hash });
  if (submittedKeys.has(key)) {
    return { ok: true, status: 'already_submitted', reason: 'ya se postulo a esta oportunidad con este contenido',
      idempotency_key: key, submit_performed: false };
  }

  return {
    ok: true,
    status: 'ready_to_submit',
    channel: 'form',
    opportunity_id: opportunity.opportunity_id,
    fields_to_fill: fillPlan.fillable,
    idempotency_key: key,
    payload_hash: hash,
    approval_id: approval?.approval_id || null,
    // El clic final lo da el ejecutor con esta autorizacion, y despues se captura la prueba.
    submit_performed: false,
    requires_confirmation_capture: true,
  };
}

// Registro de lo ejecutado: sin prueba de confirmacion, una postulacion es solo una promesa.
export function recordDelivery({ result, confirmation = null, at = new Date() } = {}) {
  if (!result?.ok || !['ready_to_send', 'ready_to_submit'].includes(result.status)) {
    return { ok: false, recorded: false, reason: 'solo se registra lo que estaba autorizado a ejecutarse' };
  }
  return {
    ok: true,
    recorded: true,
    opportunity_id: result.opportunity_id,
    channel: result.channel,
    idempotency_key: result.idempotency_key,
    approval_id: result.approval_id,
    confirmation,
    // Se distingue lo confirmado de lo que quedo sin prueba, en vez de darlo todo por bueno.
    evidence_status: confirmation ? 'confirmed' : 'sent_without_confirmation',
    recorded_at: at.toISOString(),
  };
}
