// Nodos status-tracker y report-scheduler.
//
// Postular es la parte facil; dar seguimiento es lo que cansa y es lo que hace que alguien
// pague una suscripcion todos los meses. Este modulo lee las respuestas que llegan al correo
// del cliente y decide cuando toca enviarle su reporte.

// Se ordenan de mas especifico a mas general: "no seguiremos adelante" es un rechazo aunque
// el correo tambien mencione la palabra "entrevista" en el historial citado.
const CLASIFICADORES = [
  {
    status: 'rejected',
    patterns: [
      /we (?:have )?(?:decided|chose) to (?:move forward|proceed) with (?:other|another)/i,
      /not (?:be )?(?:moving|proceeding) forward with your application/i,
      /unfortunately|lamentamos|no (?:hemos )?(?:seleccionad|continuar)/i,
      /hemos decidido continuar con (?:otros|otras)/i,
      /no (?:seguiremos|avanzaremos) adelante/i,
    ],
  },
  {
    status: 'interview_invite',
    patterns: [
      /(?:invite|invitar|invitamos) (?:you )?(?:to|a) (?:an? )?(?:interview|entrevista)/i,
      /schedule (?:an? )?(?:interview|call|chat)/i,
      /agendar (?:una )?(?:entrevista|llamada)/i,
      /nos gustaria (?:conocerte|entrevistarte)/i,
      /available for (?:a )?(?:call|interview)/i,
    ],
  },
  {
    status: 'info_requested',
    patterns: [
      /could you (?:please )?(?:send|provide|share)/i,
      /(?:podrias|puedes) (?:enviarnos|compartir|facilitar)/i,
      /we need (?:some )?(?:additional|more) information/i,
      /necesitamos (?:mas )?informacion/i,
      /complete (?:the|your) (?:assessment|test|prueba)/i,
    ],
  },
  {
    status: 'acknowledged',
    patterns: [
      /(?:we|hemos) (?:have )?received your application/i,
      /(?:gracias por|thank you for) (?:tu|su|your) (?:postulacion|solicitud|application)/i,
      /application (?:has been )?(?:received|submitted)/i,
    ],
  },
];

// Correos automaticos que no dicen nada del proceso y no deben mover el estado.
const RUIDO = [
  /do not reply|no responder a este correo/i,
  /newsletter|boletin/i,
  /survey|encuesta/i,
];

export function classifyReply(message = {}) {
  const text = `${message.subject || ''} ${message.body || ''}`;
  if (!text.trim()) {
    return { status: 'unknown', confidence: 'none', reason: 'mensaje vacio', requires_human: true };
  }

  const esRuido = RUIDO.some((pattern) => pattern.test(text));
  const match = CLASIFICADORES.find((item) => item.patterns.some((pattern) => pattern.test(text)));

  if (!match) {
    // Sin senal clara no se inventa un estado: un rechazo mal clasificado como entrevista
    // haria que el cliente esperara una llamada que nunca llega.
    return { status: 'unknown', confidence: 'none', reason: esRuido ? 'correo automatico sin señal' : 'sin patron reconocido', requires_human: true };
  }

  return {
    status: match.status,
    confidence: 'media',
    // Una invitacion a entrevista siempre pasa por el cliente: es una cita en su agenda.
    requires_human: match.status === 'interview_invite' || match.status === 'info_requested',
    matched_from: message.from || null,
  };
}

export function trackReplies(messages = [], applications = []) {
  const porOportunidad = new Map(applications.map((item) => [item.opportunity_id, item]));
  const actualizaciones = [];
  const sinVincular = [];

  for (const message of messages) {
    const classification = classifyReply(message);
    // Sin poder atar la respuesta a una postulacion concreta no se toca ningun estado.
    const opportunityId = message.opportunity_id
      || applications.find((item) => item.company && new RegExp(escapeRegex(item.company), 'i').test(`${message.from || ''} ${message.subject || ''}`))?.opportunity_id
      || null;

    if (!opportunityId || classification.status === 'unknown') {
      sinVincular.push({ from: message.from || null, subject: message.subject || null, reason: !opportunityId ? 'sin postulacion asociada' : classification.reason });
      continue;
    }

    actualizaciones.push({
      opportunity_id: opportunityId,
      company: porOportunidad.get(opportunityId)?.company || null,
      previous_status: porOportunidad.get(opportunityId)?.status || null,
      new_status: classification.status,
      requires_human: classification.requires_human,
      received_at: message.received_at || null,
    });
  }

  const porEstado = actualizaciones.reduce((acc, item) => {
    acc[item.new_status] = (acc[item.new_status] || 0) + 1;
    return acc;
  }, {});

  return {
    ok: true,
    messages_read: messages.length,
    updates: actualizaciones.length,
    by_status: porEstado,
    needs_human: actualizaciones.filter((item) => item.requires_human).length,
    // Lo que no se pudo vincular se muestra en vez de descartarse: puede ser una entrevista.
    unlinked: sinVincular,
    updates_detail: actualizaciones,
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- report-scheduler --------------------------------------------------------
// La cadencia la elige el cliente. Por defecto cada hora, pero puede pedir una hora fija.
export function nextReportAt({ cadence = 'hourly', atHour = null, timezoneOffsetMinutes = 0, lastSentAt = null, now = new Date() } = {}) {
  const ultimo = lastSentAt ? new Date(lastSentAt) : null;

  if (cadence === 'hourly') {
    const proximo = ultimo ? new Date(ultimo.getTime() + 3600000) : new Date(now.getTime() + 3600000);
    return { ok: true, cadence, next_at: proximo.toISOString(), due: proximo <= now };
  }

  if (cadence === 'daily') {
    if (atHour === null || atHour === undefined) {
      const error = new Error('La cadencia diaria necesita la hora que eligio el cliente');
      error.code = 'MISSING_HOUR';
      throw error;
    }
    // Se calcula en la zona del cliente: un reporte a las 8 debe llegar a SUS 8, no a las del servidor.
    const local = new Date(now.getTime() + timezoneOffsetMinutes * 60000);
    const objetivo = new Date(local);
    objetivo.setUTCHours(atHour, 0, 0, 0);
    if (objetivo <= local) objetivo.setUTCDate(objetivo.getUTCDate() + 1);
    const proximo = new Date(objetivo.getTime() - timezoneOffsetMinutes * 60000);
    return { ok: true, cadence, at_hour: atHour, next_at: proximo.toISOString(), due: false };
  }

  if (cadence === 'manual') {
    return { ok: true, cadence, next_at: null, due: false, reason: 'el cliente pidio enviarlo solo bajo peticion' };
  }

  const error = new Error(`Cadencia desconocida: ${cadence}`);
  error.code = 'UNKNOWN_CADENCE';
  throw error;
}

// No se envia un reporte vacio: molestar cada hora sin novedades hace que el cliente lo
// silencie, y entonces se pierde el aviso que si importaba.
export function shouldSendReport({ schedule, hasNews, now = new Date() } = {}) {
  if (!schedule?.ok) return { send: false, reason: 'sin planificacion valida' };
  if (schedule.cadence === 'manual') return { send: false, reason: 'envio manual' };
  const due = schedule.next_at ? new Date(schedule.next_at) <= now : false;
  if (!due) return { send: false, reason: 'todavia no toca' };
  if (!hasNews) return { send: false, reason: 'sin novedades: no se envia un reporte vacio' };
  return { send: true, reason: 'toca y hay novedades' };
}
