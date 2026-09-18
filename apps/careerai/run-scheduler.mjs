// Nodo run-scheduler (node-inventory.json: "Disparo programado por tenant", bloque
// "Tenancy, suscripcion y cuotas"). Logica pura, mismo criterio que rate-limiter.mjs: no
// duerme, no dispara nada, no toca un cron real — solo decide si TOCA correr ahora para un
// tenant dado su plan y su historial. Quien orqueste el cron real (fuera de este modulo)
// llama a `shouldRunNow` en cada tick y actua segun el resultado.
//
// Dos preguntas independientes, cada una puede bloquear por su cuenta: (1) ya paso el
// intervalo minimo desde la ultima corrida (cadencia), y (2) el tenant no se paso de su cuota
// del plan (para no dejar que un plan gratuito corra sin limite y gaste recursos/credito de
// LLM de todos).

// Intervalo minimo entre corridas por plan, en minutos. Sin plan declarado, se aplica el mas
// conservador (el mas largo) — igual que rate-limiter.mjs con portales desconocidos: de todas
// las decisiones posibles, esa es la unica que nunca hace daño por ser demasiado cauta.
const PLAN_INTERVAL_MINUTES = {
  free: 24 * 60, // una corrida al dia
  pro: 4 * 60, // cada 4 horas
  enterprise: 30, // cada media hora
};
const DEFAULT_INTERVAL_MINUTES = Math.max(...Object.values(PLAN_INTERVAL_MINUTES));

// Cuota de corridas por dia, por plan. Igual criterio: sin plan declarado, la mas conservadora.
const PLAN_DAILY_QUOTA = {
  free: 1,
  pro: 6,
  enterprise: 48,
};
const DEFAULT_DAILY_QUOTA = Math.min(...Object.values(PLAN_DAILY_QUOTA));

export function getIntervalMinutes(plan) {
  const key = String(plan || '').toLowerCase().trim();
  return PLAN_INTERVAL_MINUTES[key] ?? DEFAULT_INTERVAL_MINUTES;
}

export function getDailyQuota(plan) {
  const key = String(plan || '').toLowerCase().trim();
  return PLAN_DAILY_QUOTA[key] ?? DEFAULT_DAILY_QUOTA;
}

// (1) cadencia: ya paso el intervalo minimo desde la ultima corrida de este tenant.
export function checkCadence({ plan, lastRunAt = null, now = new Date(), intervalMinutes } = {}) {
  const interval = Number.isFinite(intervalMinutes) ? intervalMinutes : getIntervalMinutes(plan);

  if (!lastRunAt) {
    return { ok: true, due: true, wait_minutes: 0, interval_minutes: interval, reason: 'sin corrida previa registrada' };
  }

  const last = lastRunAt instanceof Date ? lastRunAt : new Date(lastRunAt);
  if (Number.isNaN(last.getTime())) {
    // Un timestamp corrupto no se interpreta como "hace mucho" (eso dispararia de mas); se
    // trata como si la corrida fuera reciente, el lado seguro.
    return { ok: false, due: false, reason: 'lastRunAt invalido', wait_minutes: interval, interval_minutes: interval };
  }

  const elapsedMinutes = (now.getTime() - last.getTime()) / 60_000;
  const due = elapsedMinutes >= interval;
  return {
    ok: true, due, interval_minutes: interval,
    wait_minutes: due ? 0 : Math.ceil(interval - elapsedMinutes),
    elapsed_minutes: Math.floor(elapsedMinutes),
  };
}

// (2) cuota: cuantas corridas lleva el tenant hoy, contra el limite de su plan.
export function checkQuota({ plan, runsToday = 0, quota } = {}) {
  const limit = Number.isFinite(quota) ? quota : getDailyQuota(plan);
  const withinQuota = runsToday < limit;
  return {
    ok: true, within_quota: withinQuota, runs_today: runsToday, daily_quota: limit,
    remaining: Math.max(0, limit - runsToday),
  };
}

// Decision combinada: solo se dispara si AMBas condiciones se cumplen. Cada una se reporta
// por separado para que quien lea el resultado sepa exactamente por que se bloqueo (cadencia
// vs. cuota son motivos distintos con soluciones distintas: esperar vs. subir de plan).
export function shouldRunNow({ tenantId, plan, lastRunAt = null, runsToday = 0, now = new Date() } = {}) {
  if (!tenantId) return { ok: false, should_run: false, reason: 'falta tenantId' };

  const cadence = checkCadence({ plan, lastRunAt, now });
  const quota = checkQuota({ plan, runsToday });

  const blockedBy = [];
  if (!cadence.due) blockedBy.push('cadencia');
  if (!quota.within_quota) blockedBy.push('cuota_diaria');

  return {
    ok: true,
    tenant_id: tenantId,
    plan: plan || 'free',
    should_run: cadence.due && quota.within_quota,
    blocked_by: blockedBy,
    cadence,
    quota,
  };
}
