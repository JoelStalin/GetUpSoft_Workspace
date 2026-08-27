import { checkRateLimit, getMinIntervalMs } from '../apps/orca/src/careerai/rate-limiter.mjs';

// --- sin accion previa: permitido de inmediato ---------------------------------
const primeraVez = checkRateLimit('indeed', { now: new Date('2026-08-27T10:00:00Z') });
if (primeraVez.allowed !== true || primeraVez.wait_ms !== 0) {
  throw new Error('Sin accion previa registrada, la primera accion debe permitirse');
}

// --- intervalo aun no transcurrido: bloqueado con wait_ms exacto --------------
const ultima = new Date('2026-08-27T10:00:00Z');
const ahora = new Date('2026-08-27T10:00:10Z'); // 10s despues; Indeed exige 45s
const bloqueado = checkRateLimit('indeed', { lastActionAt: ultima, now: ahora });
if (bloqueado.allowed !== false) throw new Error('A los 10s de 45s requeridos, debe bloquear');
if (bloqueado.wait_ms !== 35_000) throw new Error(`Esperaba 35000ms de espera, obtuve ${bloqueado.wait_ms}`);

// --- intervalo ya transcurrido: permitido --------------------------------------
const yaPaso = checkRateLimit('indeed', { lastActionAt: ultima, now: new Date('2026-08-27T10:00:45Z') });
if (yaPaso.allowed !== true) throw new Error('A los 45s exactos ya debe permitirse');

// --- portales conocidos tienen intervalos distintos -----------------------------
if (getMinIntervalMs('greenhouse') >= getMinIntervalMs('linkedin')) {
  throw new Error('LinkedIn debe exigir mas espacio que Greenhouse (defensa anti-bot mas agresiva)');
}

// --- portal desconocido: usa el intervalo mas conservador, no inventa uno corto -
const desconocido = checkRateLimit('portal-nuevo', { lastActionAt: ultima, now: new Date('2026-08-27T10:00:50Z') });
const maxConocido = Math.max(getMinIntervalMs('indeed'), getMinIntervalMs('linkedin'), getMinIntervalMs('workday'));
if (getMinIntervalMs('portal-nuevo') !== maxConocido) {
  throw new Error('Un portal no registrado debe usar el intervalo mas conservador de la tabla');
}

// --- override explicito de minIntervalMs respetado ------------------------------
const conOverride = checkRateLimit('lever', { lastActionAt: ultima, now: new Date('2026-08-27T10:00:05Z'), minIntervalMs: 3_000 });
if (conOverride.allowed !== true) throw new Error('Con un override mas corto ya explicito, debe permitir a los 5s');

// --- fecha invalida: falla explicitamente, no asume que esta permitido ---------
const fechaInvalida = checkRateLimit('indeed', { lastActionAt: 'no-es-una-fecha', now: ahora });
if (fechaInvalida.ok !== false) throw new Error('Una lastActionAt invalida debe fallar explicitamente');

// --- reloj inconsistente (ultima accion en el futuro): bloquea, no resta negativo
const relojInconsistente = checkRateLimit('indeed', { lastActionAt: new Date('2026-08-27T11:00:00Z'), now: ahora });
if (relojInconsistente.ok !== false || relojInconsistente.allowed !== false) {
  throw new Error('lastActionAt en el futuro respecto a now debe bloquear, no calcular espera negativa');
}

console.log(JSON.stringify({
  ok: true,
  node: 'rate-limiter',
  portales_con_intervalo_propio: ['indeed', 'linkedin', 'glassdoor', 'greenhouse', 'lever', 'workday'],
  portal_desconocido_usa_maximo_conservador: true,
  reloj_inconsistente_bloquea: true,
}));
