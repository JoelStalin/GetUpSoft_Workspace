// Dos guardas que evitan errores caros para el cliente:
//   remote-verifier          -> detecta el "remoto" que en realidad no lo es
//   approval-expiry-watchdog -> impide postular con una aprobacion vencida o alterada
import crypto from 'node:crypto';

// --- remote-verifier ---------------------------------------------------------
// Postular a una vacante anunciada como remota que exige presencia mensual hace perder el
// tiempo del cliente y quema la candidatura. Se marca antes de gastar una postulacion.
const HIBRIDO = [
  { pattern: /\bhybrid\b|\bh[ií]brido\b/i, flag: 'hybrid' },
  { pattern: /\b(\d+)\s*days?\s*(?:per|a|\/)\s*week\s*(?:in|at)\s*(?:the\s*)?office/i, flag: 'office_days_per_week' },
  { pattern: /on-?site\s*(?:required|obligatorio)|presencial\s*obligatorio/i, flag: 'onsite_required' },
  { pattern: /\bmust (?:be able to )?(?:relocate|commute)\b|debe\s*(?:mudarse|trasladarse)/i, flag: 'relocation_required' },
  { pattern: /quarterly\s*(?:on-?site|travel|visits?)|visitas?\s*trimestrales?/i, flag: 'periodic_onsite' },
  { pattern: /once a (?:week|month)\s*(?:in|at)\s*(?:the\s*)?office/i, flag: 'periodic_onsite' },
];

// Restricciones geograficas: "remoto" que en la practica excluye al candidato.
const GEO = [
  { pattern: /remote\s*\(?\s*(?:us|usa|united states)\s*only\s*\)?/i, flag: 'us_only' },
  { pattern: /must (?:be|reside) (?:located )?(?:in|within) (?:the )?(?:us|usa|united states|eu|canada)/i, flag: 'residency_required' },
  { pattern: /work authorization required|no sponsorship/i, flag: 'no_sponsorship' },
  { pattern: /geolocked|geo-?restricted/i, flag: 'geolocked' },
  { pattern: /security clearance/i, flag: 'clearance_required' },
];

export function verifyRemote(opportunity = {}, { candidateCountry = null } = {}) {
  const text = `${opportunity.title || ''} ${opportunity.location || ''} ${opportunity.description || ''}`;
  const hybridFlags = HIBRIDO.filter((item) => item.pattern.test(text)).map((item) => item.flag);
  const geoFlags = GEO.filter((item) => item.pattern.test(text)).map((item) => item.flag);

  const declaredRemote = /\bremote\b|\bremoto\b|\bteletrabajo\b|work from home|anywhere/i.test(text);
  const trulyRemote = declaredRemote && hybridFlags.length === 0;

  // Solo se opina sobre elegibilidad si sabemos donde esta el candidato; inventar
  // una restriccion que no aplica descartaria vacantes validas.
  let eligibility = 'unknown';
  if (candidateCountry) {
    const restricted = geoFlags.filter((flag) => ['us_only', 'residency_required', 'no_sponsorship', 'clearance_required'].includes(flag));
    eligibility = restricted.length && candidateCountry.toUpperCase() !== 'US' ? 'likely_ineligible' : 'likely_eligible';
  }

  return {
    ok: true,
    opportunity_id: opportunity.opportunity_id || null,
    declared_remote: declaredRemote,
    remote_verified: trulyRemote,
    hybrid_signals: hybridFlags,
    geo_signals: geoFlags,
    eligibility,
    // Se reporta, no se descarta: la decision final es del cliente.
    recommendation: !declaredRemote ? 'no_declara_remoto'
      : hybridFlags.length ? 'revisar: anunciado remoto pero exige presencia'
      : eligibility === 'likely_ineligible' ? 'revisar: restriccion geografica o de autorizacion'
      : 'remoto_confirmado',
  };
}

// --- approval-expiry-watchdog ------------------------------------------------
// El contrato ApprovalRequest exige expires_at y payload_hash, pero nadie los vigilaba.
// Una aprobacion vencida o cuyo contenido cambio despues de aprobarse no puede ejecutarse.
export function hashPayload(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function checkApproval(approval, { opportunityId, payload = null, actor = null, now = new Date() } = {}) {
  const problemas = [];

  if (!approval) return { ok: false, valid: false, reasons: ['sin_aprobacion'], submit_allowed: false };
  if (approval.status !== 'approved') problemas.push(`estado_${approval.status || 'desconocido'}`);
  // La aprobacion es POR oportunidad: aprobar una no autoriza a postular a otra.
  if (opportunityId && approval.opportunity_id !== opportunityId) problemas.push('oportunidad_distinta');
  if (approval.expires_at && new Date(approval.expires_at) <= now) problemas.push('aprobacion_vencida');
  if (!approval.expires_at) problemas.push('sin_fecha_de_expiracion');
  if (actor && approval.allowed_actor && approval.allowed_actor !== actor) problemas.push('actor_no_autorizado');
  // Si el contenido cambio tras aprobarse, lo aprobado ya no es lo que se enviaria.
  if (payload && approval.payload_hash && approval.payload_hash !== hashPayload(payload)) {
    problemas.push('contenido_alterado_tras_aprobar');
  }

  const valid = problemas.length === 0;
  return {
    ok: true,
    valid,
    approval_id: approval.approval_id || null,
    opportunity_id: approval.opportunity_id || null,
    reasons: problemas,
    submit_allowed: valid,
    expires_in_seconds: approval.expires_at ? Math.max(0, Math.floor((new Date(approval.expires_at) - now) / 1000)) : null,
  };
}

// Barrido periodico: marca las aprobaciones vencidas para que no queden vivas por descuido.
export function sweepExpired(approvals = [], now = new Date()) {
  const vencidas = approvals.filter((item) => item.status === 'approved' && item.expires_at && new Date(item.expires_at) <= now);
  return {
    ok: true,
    total: approvals.length,
    expired: vencidas.length,
    still_valid: approvals.filter((item) => item.status === 'approved' && (!item.expires_at || new Date(item.expires_at) > now)).length,
    expired_ids: vencidas.map((item) => item.approval_id),
    swept_at: now.toISOString(),
  };
}
