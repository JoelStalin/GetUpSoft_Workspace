import { prepareEmailApplication, prepareFormSubmit, recordDelivery, idempotencyKey } from '../apps/orca/src/careerai/senders.mjs';
import { hashPayload } from '../apps/orca/src/careerai/guards.mjs';

const ahora = new Date('2026-08-27T12:00:00Z');
const oportunidad = { opportunity_id: 'opp-1', title: 'Analista', company: 'Empresa A' };
const aprobacion = {
  approval_id: 'ap-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-08-27T13:00:00Z',
};

// --- email-apply-sender ------------------------------------------------------
const listo = prepareEmailApplication({
  opportunity: oportunidad, approval: aprobacion,
  cv: '/tmp/cv.pdf', coverLetter: '/tmp/carta.pdf',
  recipient: 'rrhh@empresa.com', allowlistDomains: ['empresa.com'], now: ahora,
});
if (listo.status !== 'ready_to_send') throw new Error('Con todo en regla debe quedar listo para enviar');
if (listo.send_performed !== false) throw new Error('Preparar no es enviar');
if (listo.attachments.length !== 2) throw new Error('Debe adjuntar CV y carta');
if (!listo.subject.includes('Empresa A')) throw new Error('El asunto debe nombrar la empresa');

// Sin destinatario no hay nada que enviar.
const sinDestino = prepareEmailApplication({ opportunity: oportunidad, approval: aprobacion, cv: 'a', coverLetter: 'b', now: ahora });
if (sinDestino.blocked_at !== 'input') throw new Error('Sin destinatario debe bloquearse en la entrada');

// Sin carta o sin CV tampoco se envia a medias.
const sinCarta = prepareEmailApplication({ opportunity: oportunidad, approval: aprobacion, cv: 'a', recipient: 'r@empresa.com', now: ahora });
if (sinCarta.ok !== false) throw new Error('Sin carta no se envia una candidatura incompleta');

// Dominio fuera de la lista permitida: no se expone informacion del cliente.
const otroDominio = prepareEmailApplication({
  opportunity: oportunidad, approval: aprobacion, cv: 'a', coverLetter: 'b',
  recipient: 'alguien@dominio-raro.com', allowlistDomains: ['empresa.com'], now: ahora,
});
if (otroDominio.blocked_at !== 'recipient') throw new Error('Un dominio no permitido debe bloquearse');

// Aprobacion vencida.
const vencida = prepareEmailApplication({
  opportunity: oportunidad, approval: { ...aprobacion, expires_at: '2026-08-27T11:00:00Z' },
  cv: 'a', coverLetter: 'b', recipient: 'rrhh@empresa.com', now: ahora,
});
if (vencida.blocked_at !== 'approval') throw new Error('Una aprobacion vencida bloquea el envio');
if (!vencida.approval_reasons.includes('aprobacion_vencida')) throw new Error('Debe decir por que');

// Idempotencia: el mismo correo no se envia dos veces.
const repetido = prepareEmailApplication({
  opportunity: oportunidad, approval: aprobacion, cv: '/tmp/cv.pdf', coverLetter: '/tmp/carta.pdf',
  recipient: 'rrhh@empresa.com', allowlistDomains: ['empresa.com'],
  sentKeys: new Set([listo.idempotency_key]), now: ahora,
});
if (repetido.status !== 'already_sent') throw new Error('No se reenvia lo ya enviado');
if (repetido.send_performed !== false) throw new Error('Ni siquiera al detectar duplicado se envia');

// --- submit-executor ---------------------------------------------------------
const planOk = { fillable: 5, can_submit_without_human: true, blocking_required_fields: [], plan: [{ field: 'email' }] };

const listoForm = prepareFormSubmit({
  opportunity: oportunidad, approval: aprobacion, fillPlan: planOk,
  sessionActive: true, botWallDetected: false, now: ahora,
});
if (listoForm.status !== 'ready_to_submit') throw new Error('Con todo en regla debe quedar listo');
if (listoForm.submit_performed !== false) throw new Error('Preparar no es enviar');
if (listoForm.requires_confirmation_capture !== true) throw new Error('Debe exigir captura de la confirmacion');

// Campo obligatorio sin resolver.
const planIncompleto = { fillable: 3, can_submit_without_human: false, blocking_required_fields: ['Autorizacion de trabajo'], plan: [] };
const incompleto = prepareFormSubmit({ opportunity: oportunidad, approval: aprobacion, fillPlan: planIncompleto, sessionActive: true, now: ahora });
if (incompleto.blocked_at !== 'fill_plan') throw new Error('Un obligatorio sin resolver bloquea el envio');
if (!incompleto.blocking_required_fields.includes('Autorizacion de trabajo')) throw new Error('Debe nombrar el campo que bloquea');

// Muro anti-bot activo.
const conMuro = prepareFormSubmit({ opportunity: oportunidad, approval: aprobacion, fillPlan: planOk, sessionActive: true, botWallDetected: true, now: ahora });
if (conMuro.blocked_at !== 'bot_wall') throw new Error('Con muro anti-bot no se envia');

// Sesion caida.
const sinSesion = prepareFormSubmit({ opportunity: oportunidad, approval: aprobacion, fillPlan: planOk, sessionActive: false, now: ahora });
if (sinSesion.blocked_at !== 'session') throw new Error('Sin sesion activa no se envia');

// Sin aprobacion.
const sinAprobacion = prepareFormSubmit({ opportunity: oportunidad, approval: null, fillPlan: planOk, sessionActive: true, now: ahora });
if (sinAprobacion.blocked_at !== 'approval') throw new Error('Sin aprobacion no se envia');

// Ya postulado con el mismo contenido.
const yaEnviado = prepareFormSubmit({
  opportunity: oportunidad, approval: aprobacion, fillPlan: planOk, sessionActive: true,
  submittedKeys: new Set([listoForm.idempotency_key]), now: ahora,
});
if (yaEnviado.status !== 'already_submitted') throw new Error('No se postula dos veces a lo mismo');

// Las claves de canal distinto no colisionan.
if (listo.idempotency_key === listoForm.idempotency_key) throw new Error('Correo y formulario deben tener claves distintas');
if (idempotencyKey({ opportunityId: 'a', channel: 'email', payloadHash: hashPayload({ x: 1 }) })
  === idempotencyKey({ opportunityId: 'b', channel: 'email', payloadHash: hashPayload({ x: 1 }) })) {
  throw new Error('Oportunidades distintas deben dar claves distintas');
}

// --- registro de lo ejecutado ------------------------------------------------
const conPrueba = recordDelivery({ result: listoForm, confirmation: 'REF-999', at: ahora });
if (conPrueba.evidence_status !== 'confirmed') throw new Error('Con confirmacion debe quedar confirmado');

const sinPrueba = recordDelivery({ result: listoForm, confirmation: null, at: ahora });
if (sinPrueba.evidence_status !== 'sent_without_confirmation') {
  throw new Error('Sin prueba no se da por confirmado: una postulacion sin evidencia es una promesa');
}

const noAutorizado = recordDelivery({ result: incompleto, at: ahora });
if (noAutorizado.recorded !== false) throw new Error('No se registra como enviado algo que estaba bloqueado');

console.log(JSON.stringify({
  ok: true,
  nodes: ['email-apply-sender', 'submit-executor'],
  guardas: ['aprobacion', 'contenido_alterado', 'destinatario', 'muro_antibot', 'sesion', 'campos_obligatorios', 'idempotencia'],
  send_performed: false,
  submit_performed: false,
}));
