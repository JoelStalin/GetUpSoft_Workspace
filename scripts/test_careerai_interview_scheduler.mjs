import { buildInterviewEvent, prepareInterviewScheduling, scheduleInterview } from '../apps/orca/src/careerai/interview-scheduler.mjs';

const now = new Date('2026-09-08T12:00:00Z');
const opportunity = { opportunity_id: 'opp-1', title: 'AS400 RPGLE Developer', company: 'Acme', canonical_url: 'https://example.invalid/job/1' };
const approval = {
  approval_id: 'appr-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-09-09T00:00:00Z', payload_hash: null,
};
const interview = {
  start: '2026-09-10T15:00:00Z', end: '2026-09-10T16:00:00Z',
  interviewerEmail: 'recruiter@acme.invalid', notes: 'Traer preguntas sobre el stack', meetingUrl: 'https://meet.example.invalid/x',
};

// --- buildInterviewEvent: pura, arma el payload ------------------------------------
const evento = buildInterviewEvent({ opportunity, interview, candidateEmail: 'candidato@example.invalid' });
if (!evento.summary.includes('AS400 RPGLE Developer') || !evento.summary.includes('Acme')) {
  throw new Error('El titulo del evento debe incluir el puesto y la empresa');
}
if (evento.attendees.length !== 2) throw new Error('Debe invitar al candidato y al entrevistador');
if (!evento.description.includes(opportunity.canonical_url)) throw new Error('La descripcion debe incluir el link de la vacante');

// --- prepareInterviewScheduling: caso feliz -----------------------------------------
const listo = prepareInterviewScheduling({ opportunity, approval, interview, candidateEmail: 'candidato@example.invalid', now });
if (listo.ok !== true || listo.status !== 'ready_to_schedule') throw new Error('Con datos validos y aprobacion vigente, debe quedar listo para agendar');
if (listo.scheduled !== false) throw new Error('Preparar nunca debe marcar scheduled:true');

// --- sin aprobacion: bloqueado -------------------------------------------------------
const sinAprobacion = prepareInterviewScheduling({ opportunity, approval: null, interview, candidateEmail: 'x@example.invalid', now });
if (sinAprobacion.ok !== false || sinAprobacion.blocked_at !== 'approval') throw new Error('Sin aprobacion vigente no debe prepararse el agendamiento');

// --- fecha en el pasado: bloqueado, no se agenda una entrevista que ya paso --------
const enElPasado = prepareInterviewScheduling({
  opportunity, approval, candidateEmail: 'x@example.invalid', now,
  interview: { ...interview, start: '2026-09-01T15:00:00Z', end: '2026-09-01T16:00:00Z' },
});
if (enElPasado.ok !== false || !/paso|ahora mismo/.test(enElPasado.reason)) throw new Error('Una entrevista en el pasado debe bloquearse con razon clara');

// --- fin antes que inicio: bloqueado --------------------------------------------------
const finAntesQueInicio = prepareInterviewScheduling({
  opportunity, approval, candidateEmail: 'x@example.invalid', now,
  interview: { start: '2026-09-10T16:00:00Z', end: '2026-09-10T15:00:00Z' },
});
if (finAntesQueInicio.ok !== false) throw new Error('Un horario donde el fin es antes del inicio debe bloquearse');

// --- sin email del candidato: bloqueado, no se agenda sin poder invitarlo ----------
const sinEmailCandidato = prepareInterviewScheduling({ opportunity, approval, interview, now });
if (sinEmailCandidato.ok !== false || !/candidato/.test(sinEmailCandidato.reason)) {
  throw new Error('Sin el email del candidato, no se puede preparar el agendamiento');
}

// --- aprobacion de otra oportunidad: bloqueado ----------------------------------------
const aprobacionCruzada = prepareInterviewScheduling({
  opportunity: { opportunity_id: 'opp-2', title: 'Otro puesto' }, approval, interview, candidateEmail: 'x@example.invalid', now,
});
if (aprobacionCruzada.ok !== false || aprobacionCruzada.blocked_at !== 'approval') {
  throw new Error('Una aprobacion de otra oportunidad no debe autorizar agendar esta');
}

// --- scheduleInterview: exige confirm:true, incluso con todo preparado -----------------
const sinConfirmar = await scheduleInterview(listo, { calendarClient: { events: { insert: async () => ({ data: { id: 'x' } }) } } });
if (sinConfirmar.ok !== false || sinConfirmar.scheduled !== false) {
  throw new Error('Sin confirm:true explicito, jamas debe agendarse de verdad');
}

// --- scheduleInterview: sin calendarClient, bloqueado ----------------------------------
const sinCliente = await scheduleInterview(listo, { confirm: true });
if (sinCliente.ok !== false) throw new Error('Sin calendarClient inyectado, no debe intentar agendar');

// --- scheduleInterview: con confirm:true y cliente, agenda de verdad -------------------
let calledWith = null;
const fakeCalendarClient = {
  events: {
    insert: async (args) => { calledWith = args; return { data: { id: 'evt_123', htmlLink: 'https://calendar.example.invalid/evt_123' } }; },
  },
};
const agendado = await scheduleInterview(listo, { confirm: true, calendarClient: fakeCalendarClient });
if (agendado.ok !== true || agendado.scheduled !== true || agendado.event_id !== 'evt_123') {
  throw new Error('Con confirm:true y cliente valido, debe agendar y devolver el event_id real');
}
if (calledWith.requestBody.attendees.length !== 2) throw new Error('El payload real enviado a Calendar debe incluir a ambos asistentes');
if (calledWith.calendarId !== 'primary') throw new Error('Debe usar el calendarId por defecto si no se especifica otro');

// --- scheduleInterview: la API real falla, se reporta, no se rompe --------------------
const clienteQueFalla = { events: { insert: async () => { throw new Error('rate limited'); } } };
const fallo = await scheduleInterview(listo, { confirm: true, calendarClient: clienteQueFalla });
if (fallo.ok !== false || fallo.scheduled !== false || !fallo.reason.includes('rate limited')) {
  throw new Error('Un fallo real de la API de Calendar debe reportarse, no silenciarse');
}

console.log(JSON.stringify({
  ok: true,
  node: 'interview-scheduler',
  arma_evento_puro_sin_api: true,
  bloquea_fecha_pasada: true,
  bloquea_sin_email_candidato: true,
  exige_confirm_true_para_agendar_real: true,
  reporta_fallo_de_api_en_vez_de_silenciarlo: true,
}));
