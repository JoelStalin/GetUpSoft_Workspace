// Nodo interview-scheduler (node-inventory.json: "Agenda en Calendar con aprobacion"). Mismo
// patron de guardas que el resto del proyecto: preparar nunca agenda, agendar exige
// aprobacion vigente Y confirm:true explicito. El cliente de Calendar se inyecta (no lo abre
// este modulo) para poder testear el flujo completo sin tocar la API real de Google, igual
// que `page` en los nodos de LinkedIn.
import { checkApproval } from './guards.mjs';

function guardResult(stage, reason, extra = {}) {
  return { ok: false, status: 'blocked', blocked_at: stage, reason, scheduled: false, ...extra };
}

// Parte pura: arma el payload del evento. No toca ninguna API — es lo que se puede probar sin
// credenciales de Google.
export function buildInterviewEvent({ opportunity, interview, candidateEmail } = {}) {
  const attendees = [];
  if (candidateEmail) attendees.push({ email: candidateEmail });
  if (interview?.interviewerEmail) attendees.push({ email: interview.interviewerEmail });

  return {
    summary: `Entrevista: ${opportunity?.title || 'Puesto'}${opportunity?.company ? ` - ${opportunity.company}` : ''}`,
    description: [
      opportunity?.company ? `Empresa: ${opportunity.company}` : null,
      opportunity?.canonical_url || opportunity?.link ? `Vacante: ${opportunity.canonical_url || opportunity.link}` : null,
      interview?.notes || null,
    ].filter(Boolean).join('\n'),
    start: interview?.start || null,
    end: interview?.end || null,
    location: interview?.location || (interview?.meetingUrl ? interview.meetingUrl : null),
    attendees,
  };
}

// Gate: aprobacion vigente por oportunidad + horario coherente. Nunca crea el evento — solo
// arma el plan.
export function prepareInterviewScheduling({
  opportunity,
  approval,
  interview,
  candidateEmail,
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return guardResult('input', 'falta opportunity_id');
  if (!interview?.start || !interview?.end) return guardResult('input', 'falta horario de inicio/fin de la entrevista');

  const start = new Date(interview.start);
  const end = new Date(interview.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return guardResult('input', 'start/end no son fechas validas');
  }
  if (end <= start) return guardResult('input', 'la entrevista debe terminar despues de empezar');
  if (start <= now) {
    // Agendar algo en el pasado (o "ahora mismo") casi siempre es un dato mal leido de un
    // correo o mensaje, no una entrevista real por venir.
    return guardResult('input', 'la fecha de la entrevista ya paso o es ahora mismo; revisar el dato de origen');
  }
  if (!candidateEmail) return guardResult('input', 'falta el email del candidato para invitarlo');

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, now });
  if (!approvalCheck.valid) return guardResult('approval', 'aprobacion no valida para agendar esta entrevista', { approval_reasons: approvalCheck.reasons });

  const event = buildInterviewEvent({ opportunity, interview, candidateEmail });

  return {
    ok: true,
    status: 'ready_to_schedule',
    opportunity_id: opportunity.opportunity_id,
    event,
    approval_id: approval?.approval_id || null,
    scheduled: false,
  };
}

// Ejecucion real: exige confirm:true explicito (segunda puerta, independiente de la
// aprobacion de negocio, igual que sendCloudApiMessage/sendWebMessage) y un calendarClient
// inyectado con un metodo `events.insert`. Sin ambos, nunca toca la API real.
export async function scheduleInterview(prepared, { confirm = false, calendarId = 'primary', calendarClient } = {}) {
  if (!prepared?.ok || prepared.status !== 'ready_to_schedule') {
    return { ok: false, scheduled: false, reason: 'nada preparado y listo para agendar', prepared };
  }
  if (confirm !== true) {
    return { ok: false, scheduled: false, reason: 'falta confirmacion explicita (confirm: true) para agendar de verdad' };
  }
  if (!calendarClient?.events?.insert) {
    return { ok: false, scheduled: false, reason: 'falta calendarClient con events.insert' };
  }

  try {
    const response = await calendarClient.events.insert({
      calendarId,
      requestBody: {
        summary: prepared.event.summary,
        description: prepared.event.description,
        location: prepared.event.location || undefined,
        start: { dateTime: prepared.event.start },
        end: { dateTime: prepared.event.end },
        attendees: prepared.event.attendees,
      },
    });
    return {
      ok: true,
      scheduled: true,
      opportunity_id: prepared.opportunity_id,
      approval_id: prepared.approval_id,
      event_id: response?.data?.id || response?.id || null,
      html_link: response?.data?.htmlLink || response?.htmlLink || null,
    };
  } catch (error) {
    return { ok: false, scheduled: false, reason: String(error?.message || error) };
  }
}
