import { decideRotation } from '../apps/orca/src/careerai/credential-rotation.mjs';

const now = new Date('2026-08-27T12:00:00Z');

// --- sin token: re-autorizar desde cero ------------------------------------------
const sinToken = decideRotation({}, { now });
if (sinToken.action !== 'reauthorize') throw new Error('Sin token almacenado, la accion debe ser reauthorize');

// --- token vigente fuera de la ventana de refresco: no hacer nada ----------------
const vigente = decideRotation({ oauth_token: 'abc', oauth_expires_at: '2026-08-27T13:00:00Z' }, { now });
if (vigente.action !== 'none') throw new Error('Un token vigente fuera de la ventana de refresco no debe rotar');

// --- token entrando a la ventana de refresco, con refresh_token: refresh ---------
const porVencerConRefresh = decideRotation(
  { oauth_token: 'abc', oauth_expires_at: '2026-08-27T12:03:00Z', refresh_token: 'r1' },
  { now },
);
if (porVencerConRefresh.action !== 'refresh') throw new Error('Dentro de la ventana de refresco con refresh_token, debe refrescar');

// --- token ya vencido, con refresh_token: refresh (no reauthorize) ---------------
const vencidoConRefresh = decideRotation(
  { oauth_token: 'abc', oauth_expires_at: '2026-08-27T11:00:00Z', refresh_token: 'r1' },
  { now },
);
if (vencidoConRefresh.action !== 'refresh') throw new Error('Vencido pero con refresh_token disponible, debe refrescar, no reautorizar');
if (vencidoConRefresh.expires_in_ms !== 0) throw new Error('Un token ya vencido no debe reportar tiempo restante negativo');

// --- token entrando a la ventana, sin refresh_token: reauthorize -----------------
const porVencerSinRefresh = decideRotation({ oauth_token: 'abc', oauth_expires_at: '2026-08-27T12:03:00Z' }, { now });
if (porVencerSinRefresh.action !== 'reauthorize') throw new Error('Por vencer sin refresh_token, debe requerir re-autorizacion');

// --- token vencido, sin refresh_token: reauthorize --------------------------------
const vencidoSinRefresh = decideRotation({ oauth_token: 'abc', oauth_expires_at: '2026-08-27T11:00:00Z' }, { now });
if (vencidoSinRefresh.action !== 'reauthorize') throw new Error('Vencido sin refresh_token, debe requerir re-autorizacion');

// --- sin expires_at declarado: no se inventa vencimiento, pero se marca para revision
const sinExpiracion = decideRotation({ oauth_token: 'abc' }, { now });
if (sinExpiracion.action !== 'none' || sinExpiracion.needs_review !== true) {
  throw new Error('Sin expires_at declarado no se debe inventar una fecha de vencimiento, pero si marcar para revision');
}

// --- ventana de refresco configurable ---------------------------------------------
const ventanaCorta = decideRotation(
  { oauth_token: 'abc', oauth_expires_at: '2026-08-27T12:03:00Z', refresh_token: 'r1' },
  { now, refreshBeforeMs: 60_000 }, // 1 minuto de margen, el token vence en 3 minutos
);
if (ventanaCorta.action !== 'none') throw new Error('Con una ventana de refresco mas corta que el tiempo restante, no debe rotar todavia');

console.log(JSON.stringify({
  ok: true,
  node: 'credential-rotation',
  acciones_posibles: ['none', 'refresh', 'reauthorize'],
  no_inventa_vencimiento_sin_declarar: true,
  no_ejecuta_refresco_real: true,
}));
