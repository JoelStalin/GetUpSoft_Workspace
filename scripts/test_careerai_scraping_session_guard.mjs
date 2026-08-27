import { checkSessionAlive } from '../apps/orca/src/careerai/scraping-session-guard.mjs';

const now = new Date('2026-08-27T12:00:00Z');

// --- sin sesion registrada: no viva, requiere login manual ----------------------
const sinSesion = checkSessionAlive(null, { tenant_id: 'joel', portal: 'indeed', now });
if (sinSesion.alive !== false || sinSesion.status !== 'missing') {
  throw new Error('Sin sesion persistida, alive debe ser false y status "missing"');
}

// --- fuga entre tenants: sesion de otro tenant nunca se reutiliza --------------
const sesionDeOtro = { tenant_id: 'otro-cliente', portal: 'indeed', expires_at: '2026-08-28T00:00:00Z' };
const cruzada = checkSessionAlive(sesionDeOtro, { tenant_id: 'joel', portal: 'indeed', now });
if (cruzada.alive !== false || cruzada.status !== 'tenant_mismatch') {
  throw new Error('Una sesion de otro tenant nunca debe considerarse viva para este tenant');
}

// --- sesion de un portal distinto no se reutiliza --------------------------------
const sesionOtroPortal = { tenant_id: 'joel', portal: 'linkedin', expires_at: '2026-08-28T00:00:00Z' };
const portalCruzado = checkSessionAlive(sesionOtroPortal, { tenant_id: 'joel', portal: 'indeed', now });
if (portalCruzado.alive !== false || portalCruzado.status !== 'portal_mismatch') {
  throw new Error('Una sesion de otro portal no debe considerarse viva');
}

// --- con expires_at: viva antes de vencer, caducada despues --------------------
const sesionConExpiracion = { tenant_id: 'joel', portal: 'indeed', expires_at: '2026-08-27T13:00:00Z' };
const viva = checkSessionAlive(sesionConExpiracion, { tenant_id: 'joel', portal: 'indeed', now });
if (viva.alive !== true || viva.status !== 'alive') throw new Error('Antes de expires_at, la sesion debe estar viva');

const caducada = checkSessionAlive(sesionConExpiracion, { tenant_id: 'joel', portal: 'indeed', now: new Date('2026-08-27T13:00:01Z') });
if (caducada.alive !== false || caducada.status !== 'expired') throw new Error('Despues de expires_at, la sesion debe estar caducada');

// --- sin expires_at: se estima por captured_at + ventana maxima ----------------
const sesionReciente = { tenant_id: 'joel', portal: 'indeed', captured_at: '2026-08-27T05:00:00Z' }; // 7h antes, ventana 12h
const frescaSinExpiracion = checkSessionAlive(sesionReciente, { tenant_id: 'joel', portal: 'indeed', now });
if (frescaSinExpiracion.alive !== true) throw new Error('Dentro de la ventana de frescura sin expiracion declarada, debe estar viva');

const sesionVieja = { tenant_id: 'joel', portal: 'indeed', captured_at: '2026-08-26T00:00:00Z' }; // 36h antes
const obsoleta = checkSessionAlive(sesionVieja, { tenant_id: 'joel', portal: 'indeed', now });
if (obsoleta.alive !== false || obsoleta.status !== 'stale') {
  throw new Error('Fuera de la ventana de frescura sin expiracion declarada, debe marcarse "stale" (requiere revalidacion)');
}

// --- sin captured_at ni expires_at: no se puede confiar en la antiguedad -------
const sinFechas = { tenant_id: 'joel', portal: 'indeed' };
const edadDesconocida = checkSessionAlive(sinFechas, { tenant_id: 'joel', portal: 'indeed', now });
if (edadDesconocida.alive !== false || edadDesconocida.status !== 'unknown_age') {
  throw new Error('Sin ninguna fecha de referencia, no se puede confiar en la sesion');
}

// --- reloj inconsistente: captured_at en el futuro respecto a now --------------
const relojFuturo = { tenant_id: 'joel', portal: 'indeed', captured_at: '2026-08-28T00:00:00Z' };
const inconsistente = checkSessionAlive(relojFuturo, { tenant_id: 'joel', portal: 'indeed', now });
if (inconsistente.ok !== false || inconsistente.status !== 'clock_inconsistent') {
  throw new Error('captured_at en el futuro respecto a now debe fallar explicitamente');
}

console.log(JSON.stringify({
  ok: true,
  node: 'scraping-session-guard',
  estados_probados: ['missing', 'tenant_mismatch', 'portal_mismatch', 'alive', 'expired', 'stale', 'unknown_age', 'clock_inconsistent'],
  fuga_entre_tenants_bloqueada: true,
}));
