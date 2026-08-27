import { classifyReply, trackReplies, nextReportAt, shouldSendReport } from '../apps/orca/src/careerai/followup.mjs';

// --- clasificacion de respuestas ---------------------------------------------
const rechazo = classifyReply({ subject: 'Your application', body: 'Unfortunately we have decided to move forward with other candidates.' });
if (rechazo.status !== 'rejected') throw new Error('Debe reconocer un rechazo');

const rechazoEs = classifyReply({ body: 'Lamentamos informarte que hemos decidido continuar con otros perfiles.' });
if (rechazoEs.status !== 'rejected') throw new Error('Debe reconocer el rechazo en espanol');

const entrevista = classifyReply({ subject: 'Next steps', body: 'We would like to invite you to an interview next week.' });
if (entrevista.status !== 'interview_invite') throw new Error('Debe reconocer la invitacion');
if (entrevista.requires_human !== true) throw new Error('Una entrevista es una cita en la agenda del cliente: siempre pasa por el');

const info = classifyReply({ body: 'Could you please send your portfolio and complete the assessment?' });
if (info.status !== 'info_requested') throw new Error('Debe reconocer la peticion de informacion');
if (info.requires_human !== true) throw new Error('Enviar informacion adicional lo decide el cliente');

const acuse = classifyReply({ body: 'We have received your application. Thank you.' });
if (acuse.status !== 'acknowledged') throw new Error('Debe reconocer el acuse de recibo');
if (acuse.requires_human !== false) throw new Error('Un acuse no requiere accion del cliente');

// El caso que motiva el orden de los clasificadores: un rechazo que cita la palabra
// "interview" en el hilo anterior no puede clasificarse como invitacion.
const rechazoConCita = classifyReply({
  subject: 'Re: Interview process',
  body: 'Thank you for attending the interview. Unfortunately we will not be moving forward with your application.',
});
if (rechazoConCita.status !== 'rejected') throw new Error('Un rechazo que menciona "interview" sigue siendo un rechazo');

// Sin senal no se inventa un estado.
const ambiguo = classifyReply({ subject: 'Hola', body: 'Saludos cordiales.' });
if (ambiguo.status !== 'unknown') throw new Error('Sin patron reconocido debe quedar unknown');
if (ambiguo.requires_human !== true) throw new Error('Lo desconocido lo revisa el cliente');
if (classifyReply({}).status !== 'unknown') throw new Error('Un mensaje vacio no clasifica');

// --- seguimiento por lote ----------------------------------------------------
const postulaciones = [
  { opportunity_id: 'o1', company: 'Empresa Alfa', status: 'applied' },
  { opportunity_id: 'o2', company: 'Empresa Beta', status: 'applied' },
];
const correos = [
  { opportunity_id: 'o1', subject: 'Next steps', body: 'We would like to schedule an interview.' },
  { from: 'rrhh@empresa-beta.com', subject: 'Empresa Beta - Application', body: 'Unfortunately we decided to move forward with other candidates.' },
  { from: 'noreply@otra.com', subject: 'Newsletter', body: 'Do not reply to this email.' },
  { from: 'alguien@desconocida.com', subject: 'Hola', body: 'We would like to invite you to an interview.' },
];

const seguimiento = trackReplies(correos, postulaciones);
if (seguimiento.messages_read !== 4) throw new Error('Debe leer los cuatro');
if (seguimiento.updates !== 2) throw new Error(`Solo dos se pueden vincular y clasificar, obtuve ${seguimiento.updates}`);
if (seguimiento.by_status.interview_invite !== 1 || seguimiento.by_status.rejected !== 1) throw new Error('Debe desglosar por estado');
if (seguimiento.needs_human !== 1) throw new Error('Solo la entrevista requiere al cliente');

// Una entrevista de una empresa que no se puede vincular NO se descarta en silencio.
const huerfana = seguimiento.unlinked.find((item) => /desconocida/.test(item.from || ''));
if (!huerfana) throw new Error('Lo no vinculado debe mostrarse: podria ser una entrevista');
if (huerfana.reason !== 'sin postulacion asociada') throw new Error('Debe decir por que no se vinculo');

// --- planificacion del reporte ------------------------------------------------
const ahora = new Date('2026-08-27T12:00:00Z');

const cadaHora = nextReportAt({ cadence: 'hourly', lastSentAt: '2026-08-27T11:00:00Z', now: ahora });
if (cadaHora.due !== true) throw new Error('Una hora despues del ultimo envio ya toca');

const reciente = nextReportAt({ cadence: 'hourly', lastSentAt: '2026-08-27T11:45:00Z', now: ahora });
if (reciente.due !== false) throw new Error('A los 15 minutos todavia no toca');

// La hora es la del cliente, no la del servidor.
const diario = nextReportAt({ cadence: 'daily', atHour: 8, timezoneOffsetMinutes: -240, now: ahora });
if (!diario.next_at) throw new Error('La cadencia diaria debe dar la proxima fecha');
if (new Date(diario.next_at) <= ahora) throw new Error('La proxima siempre es futura');

let code = null;
try { nextReportAt({ cadence: 'daily', now: ahora }); } catch (error) { code = error.code; }
if (code !== 'MISSING_HOUR') throw new Error('La cadencia diaria exige la hora del cliente');
try { nextReportAt({ cadence: 'cada-luna-llena', now: ahora }); } catch (error) { code = error.code; }
if (code !== 'UNKNOWN_CADENCE') throw new Error('Una cadencia desconocida debe fallar explicitamente');

const manual = nextReportAt({ cadence: 'manual', now: ahora });
if (manual.next_at !== null) throw new Error('El envio manual no se planifica');

// No se envia un reporte vacio: molestar sin novedades hace que el cliente lo silencie.
const conNovedades = shouldSendReport({ schedule: cadaHora, hasNews: true, now: ahora });
if (conNovedades.send !== true) throw new Error('Si toca y hay novedades, se envia');

const sinNovedades = shouldSendReport({ schedule: cadaHora, hasNews: false, now: ahora });
if (sinNovedades.send !== false) throw new Error('Sin novedades no se envia');
if (!/reporte vacio/.test(sinNovedades.reason)) throw new Error('Debe explicar por que no se envia');

const noToca = shouldSendReport({ schedule: reciente, hasNews: true, now: ahora });
if (noToca.send !== false) throw new Error('Si no toca, no se envia aunque haya novedades');

console.log(JSON.stringify({
  ok: true,
  nodes: ['status-tracker', 'report-scheduler'],
  estados: ['rejected', 'interview_invite', 'info_requested', 'acknowledged', 'unknown'],
  no_vinculados_visibles: seguimiento.unlinked.length,
  cadencias: ['hourly', 'daily', 'manual'],
}));
