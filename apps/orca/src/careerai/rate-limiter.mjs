// Nodo rate-limiter. Decide si una accion sobre un portal puede ejecutarse ahora o debe
// esperar, para imitar espaciado humano y no gatillar defensas anti-bot. Logica pura: no
// duerme, no reintenta, no toca el navegador — solo calcula. `now` y `lastActionAt` se
// inyectan para que el calculo sea reproducible en tests.

// Intervalo minimo entre acciones por portal, en milisegundos. Portales mas agresivos
// detectando bots (Indeed, LinkedIn) piden mas espacio que un ATS de una sola pagina.
const PORTAL_MIN_INTERVAL_MS = {
  indeed: 45_000,
  linkedin: 90_000,
  glassdoor: 60_000,
  greenhouse: 20_000,
  lever: 20_000,
  workday: 60_000,
};

// Portal no declarado: no se inventa un numero optimista. Se aplica el intervalo mas
// conservador (el mas largo) de la tabla conocida — de todas las decisiones posibles, esa
// es la unica que nunca hace daño por ser demasiado cauta.
const DEFAULT_MIN_INTERVAL_MS = Math.max(...Object.values(PORTAL_MIN_INTERVAL_MS));

export function getMinIntervalMs(portal) {
  const key = String(portal || '').toLowerCase().trim();
  return PORTAL_MIN_INTERVAL_MS[key] ?? DEFAULT_MIN_INTERVAL_MS;
}

export function checkRateLimit(portal, { lastActionAt = null, now = new Date(), minIntervalMs } = {}) {
  const interval = Number.isFinite(minIntervalMs) ? minIntervalMs : getMinIntervalMs(portal);

  if (!lastActionAt) {
    // Sin accion previa registrada para este portal: no hay nada que espaciar todavia.
    return { ok: true, portal, allowed: true, wait_ms: 0, min_interval_ms: interval, reason: 'sin accion previa registrada' };
  }

  const last = lastActionAt instanceof Date ? lastActionAt : new Date(lastActionAt);
  if (Number.isNaN(last.getTime())) {
    return { ok: false, portal, allowed: false, wait_ms: null, reason: 'lastActionAt no es una fecha valida' };
  }

  const elapsedMs = now.getTime() - last.getTime();
  if (elapsedMs < 0) {
    // La ultima accion registrada esta en el futuro respecto a "now": reloj inconsistente,
    // no se puede confiar en el calculo. Se bloquea en vez de arriesgar espaciado negativo.
    return { ok: false, portal, allowed: false, wait_ms: null, reason: 'lastActionAt es posterior a now; reloj inconsistente' };
  }

  if (elapsedMs >= interval) {
    return { ok: true, portal, allowed: true, wait_ms: 0, min_interval_ms: interval, reason: 'intervalo minimo ya transcurrido' };
  }

  return {
    ok: true, portal, allowed: false, wait_ms: interval - elapsedMs, min_interval_ms: interval,
    reason: `deben pasar ${interval} ms entre acciones en ${portal || 'portal desconocido'}; faltan ${interval - elapsedMs} ms`,
  };
}
