import { checkCadence, checkQuota, shouldRunNow, getIntervalMinutes, getDailyQuota } from '../platform/orca/src/careerai/run-scheduler.mjs';

const now = new Date('2026-09-07T12:00:00Z');

// --- cadencia: sin corrida previa, siempre due --------------------------------------
const sinPrevia = checkCadence({ plan: 'pro', lastRunAt: null, now });
if (sinPrevia.due !== true) throw new Error('Sin corrida previa, debe estar due de inmediato');

// --- cadencia: corrida reciente, plan free (24h) — no due todavia -------------------
const reciente = checkCadence({ plan: 'free', lastRunAt: new Date('2026-09-07T06:00:00Z'), now });
if (reciente.due !== false) throw new Error('A las 6h de la ultima corrida, un plan free (24h) no debe estar due');
if (reciente.wait_minutes <= 0) throw new Error('Debe reportar cuanto falta, no solo que esta bloqueado');

// --- cadencia: mismo caso pero plan enterprise (30min) — si due --------------------
const enterpriseDue = checkCadence({ plan: 'enterprise', lastRunAt: new Date('2026-09-07T06:00:00Z'), now });
if (enterpriseDue.due !== true) throw new Error('Con un plan enterprise (30min de intervalo), 6h despues debe estar due');

// --- cadencia: plan desconocido usa el intervalo MAS conservador (el mas largo) -----
if (getIntervalMinutes('plan-inventado') !== getIntervalMinutes('free')) {
  throw new Error('Un plan no declarado debe usar el intervalo mas largo conocido, nunca uno optimista');
}

// --- cadencia: timestamp corrupto no se trata como "hace mucho" --------------------
const corrupto = checkCadence({ plan: 'pro', lastRunAt: 'no-es-una-fecha', now });
if (corrupto.due !== false) throw new Error('Un timestamp invalido debe tratarse como reciente (lado seguro), no como hace mucho');

// --- cuota: dentro del limite --------------------------------------------------------
const dentroDeCuota = checkQuota({ plan: 'pro', runsToday: 3 });
if (dentroDeCuota.within_quota !== true) throw new Error('3 de 6 corridas (plan pro) debe estar dentro de cuota');
if (dentroDeCuota.remaining !== 3) throw new Error('Debe calcular cuantas corridas quedan');

// --- cuota: se paso del limite -------------------------------------------------------
const fueraDeCuota = checkQuota({ plan: 'free', runsToday: 1 });
if (fueraDeCuota.within_quota !== false) throw new Error('Plan free permite 1 corrida diaria: la segunda debe estar fuera de cuota');

// --- cuota: plan desconocido usa el limite MAS conservador (el mas bajo) -----------
if (getDailyQuota('plan-inventado') !== getDailyQuota('free')) {
  throw new Error('Un plan no declarado debe usar la cuota mas baja conocida, nunca una generosa');
}

// --- shouldRunNow: ambas condiciones se cumplen -> corre -----------------------------
const corre = shouldRunNow({
  tenantId: 't1', plan: 'enterprise', lastRunAt: new Date('2026-09-07T06:00:00Z'), runsToday: 2, now,
});
if (corre.should_run !== true) throw new Error(`Con cadencia y cuota OK, debe correr. blocked_by: ${JSON.stringify(corre.blocked_by)}`);
if (corre.blocked_by.length !== 0) throw new Error('Si deberia correr, blocked_by debe estar vacio');

// --- shouldRunNow: cadencia bloquea, aunque la cuota este bien ----------------------
const bloqueadoPorCadencia = shouldRunNow({
  tenantId: 't1', plan: 'free', lastRunAt: new Date('2026-09-07T06:00:00Z'), runsToday: 0, now,
});
if (bloqueadoPorCadencia.should_run !== false) throw new Error('Con cadencia sin cumplir, no debe correr aunque la cuota este bien');
if (!bloqueadoPorCadencia.blocked_by.includes('cadencia')) throw new Error('Debe reportar la cadencia como motivo del bloqueo');

// --- shouldRunNow: cuota bloquea, aunque la cadencia este bien ----------------------
const bloqueadoPorCuota = shouldRunNow({
  tenantId: 't1', plan: 'free', lastRunAt: null, runsToday: 1, now,
});
if (bloqueadoPorCuota.should_run !== false) throw new Error('Con cuota agotada, no debe correr aunque la cadencia este bien');
if (!bloqueadoPorCuota.blocked_by.includes('cuota_diaria')) throw new Error('Debe reportar la cuota como motivo del bloqueo');

// --- shouldRunNow: ambas bloquean a la vez, se reportan las dos --------------------
const ambasBloquean = shouldRunNow({
  tenantId: 't1', plan: 'free', lastRunAt: new Date('2026-09-07T06:00:00Z'), runsToday: 1, now,
});
if (ambasBloquean.blocked_by.length !== 2) throw new Error('Si ambas condiciones fallan, deben reportarse las dos, no solo la primera');

// --- shouldRunNow: sin tenantId no se puede decidir nada ----------------------------
const sinTenant = shouldRunNow({ plan: 'pro', now });
if (sinTenant.ok !== false) throw new Error('Sin tenantId, no hay nada que programar');

console.log(JSON.stringify({
  ok: true,
  node: 'run-scheduler',
  cadencia_por_plan: true,
  cuota_diaria_por_plan: true,
  plan_desconocido_usa_valores_conservadores: true,
  timestamp_corrupto_tratado_como_reciente: true,
  reporta_ambos_motivos_de_bloqueo_independientes: true,
}));
