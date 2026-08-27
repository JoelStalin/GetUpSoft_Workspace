import { verifyRemote, checkApproval, sweepExpired, hashPayload } from '../apps/orca/src/careerai/guards.mjs';

// --- remote-verifier ---------------------------------------------------------
const remotoReal = verifyRemote({
  opportunity_id: 'a', title: 'Analista', location: 'Remote',
  description: 'Posicion totalmente remota, equipo distribuido.',
});
if (remotoReal.remote_verified !== true) throw new Error('Un remoto real debe confirmarse');
if (remotoReal.recommendation !== 'remoto_confirmado') throw new Error('Debe recomendar continuar');

// El caso que motiva el nodo: anunciado remoto pero exige presencia.
const falsoRemoto = verifyRemote({
  opportunity_id: 'b', title: 'Analista (Remote)', location: 'Remote',
  description: 'Trabajo remoto con 2 days per week in the office.',
});
if (falsoRemoto.declared_remote !== true) throw new Error('Se anuncia como remoto');
if (falsoRemoto.remote_verified !== false) throw new Error('Pero no es remoto de verdad');
if (!falsoRemoto.hybrid_signals.includes('office_days_per_week')) throw new Error('Debe decir por que');
if (!/exige presencia/.test(falsoRemoto.recommendation)) throw new Error('La recomendacion debe explicarse');

const hibrido = verifyRemote({ opportunity_id: 'c', description: 'Remote / hybrid role based in Madrid.' });
if (hibrido.remote_verified !== false) throw new Error('Hibrido no es remoto');

const trimestral = verifyRemote({ opportunity_id: 'd', description: 'Fully remote with quarterly on-site visits.' });
if (!trimestral.hybrid_signals.includes('periodic_onsite')) throw new Error('La presencia periodica cuenta');

// Sin declararse remoto no se inventa una conclusion.
const presencial = verifyRemote({ opportunity_id: 'e', description: 'Puesto en nuestras oficinas centrales.' });
if (presencial.declared_remote !== false) throw new Error('No declara remoto');
if (presencial.recommendation !== 'no_declara_remoto') throw new Error('Debe decirlo tal cual');

// Elegibilidad: solo se opina si sabemos donde esta el candidato.
const sinPais = verifyRemote({ opportunity_id: 'f', description: 'Remote (US only). No sponsorship.' });
if (sinPais.eligibility !== 'unknown') throw new Error('Sin pais del candidato no se opina sobre elegibilidad');

const conPais = verifyRemote({ opportunity_id: 'g', description: 'Remote (US only). No sponsorship.' }, { candidateCountry: 'DO' });
if (conPais.eligibility !== 'likely_ineligible') throw new Error('Con restriccion y candidato fuera, es probable inelegible');
if (!conPais.geo_signals.includes('us_only')) throw new Error('Debe reportar la restriccion concreta');

const dentro = verifyRemote({ opportunity_id: 'h', description: 'Remote (US only).' }, { candidateCountry: 'US' });
if (dentro.eligibility !== 'likely_eligible') throw new Error('Un candidato dentro del pais si es elegible');

// --- approval-expiry-watchdog ------------------------------------------------
const ahora = new Date('2026-08-27T12:00:00Z');
const payload = { cv: 'v3', carta: 'v3' };
const base = {
  approval_id: 'ap-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-08-27T13:00:00Z', allowed_actor: 'cliente-1', payload_hash: hashPayload(payload),
};

const valida = checkApproval(base, { opportunityId: 'opp-1', payload, actor: 'cliente-1', now: ahora });
if (!valida.valid || !valida.submit_allowed) throw new Error('Una aprobacion vigente y coherente debe permitir enviar');
if (valida.expires_in_seconds !== 3600) throw new Error('Debe informar cuanto le queda');

// Vencida.
const vencida = checkApproval({ ...base, expires_at: '2026-08-27T11:00:00Z' }, { opportunityId: 'opp-1', payload, now: ahora });
if (vencida.valid || vencida.submit_allowed) throw new Error('Una aprobacion vencida no autoriza nada');
if (!vencida.reasons.includes('aprobacion_vencida')) throw new Error('Debe decir que vencio');

// Aprobada para otra oportunidad.
const otra = checkApproval(base, { opportunityId: 'opp-2', payload, now: ahora });
if (otra.valid) throw new Error('Aprobar una oportunidad no autoriza a postular a otra');
if (!otra.reasons.includes('oportunidad_distinta')) throw new Error('Debe decir que es otra oportunidad');

// El contenido cambio despues de aprobarse: lo aprobado ya no es lo que se enviaria.
const alterada = checkApproval(base, { opportunityId: 'opp-1', payload: { cv: 'v4', carta: 'v3' }, now: ahora });
if (alterada.valid) throw new Error('Si el contenido cambio, la aprobacion no vale');
if (!alterada.reasons.includes('contenido_alterado_tras_aprobar')) throw new Error('Debe detectar la alteracion');

// Actor distinto.
const otroActor = checkApproval(base, { opportunityId: 'opp-1', payload, actor: 'intruso', now: ahora });
if (otroActor.valid) throw new Error('Solo el actor autorizado puede usar la aprobacion');

// Sin fecha de expiracion: no se acepta una aprobacion eterna.
const eterna = checkApproval({ ...base, expires_at: null }, { opportunityId: 'opp-1', payload, now: ahora });
if (eterna.valid) throw new Error('Una aprobacion sin expiracion no es aceptable');

// Sin aprobacion no hay envio.
const nada = checkApproval(null, { opportunityId: 'opp-1' });
if (nada.valid || nada.submit_allowed) throw new Error('Sin aprobacion no se envia nada');

// Barrido periodico.
const barrido = sweepExpired([
  base,
  { approval_id: 'ap-2', status: 'approved', expires_at: '2026-08-27T10:00:00Z' },
  { approval_id: 'ap-3', status: 'approved', expires_at: '2026-08-27T09:00:00Z' },
  { approval_id: 'ap-4', status: 'pending', expires_at: '2026-08-27T09:00:00Z' },
], ahora);
if (barrido.expired !== 2) throw new Error('Debe marcar las dos vencidas');
if (barrido.still_valid !== 1) throw new Error('Solo una sigue vigente');
if (barrido.expired_ids.includes('ap-4')) throw new Error('Una pendiente no estaba aprobada, no cuenta como vencida');

console.log(JSON.stringify({
  ok: true,
  nodes: ['remote-verifier', 'approval-expiry-watchdog'],
  falsos_remotos_detectados: ['office_days_per_week', 'hybrid', 'periodic_onsite'],
  aprobaciones_rechazadas: ['vencida', 'otra_oportunidad', 'contenido_alterado', 'actor_no_autorizado', 'sin_expiracion'],
}));
