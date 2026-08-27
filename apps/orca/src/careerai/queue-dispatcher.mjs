// Nodo queue-dispatcher. Serializa corridas por tenant: decide si una nueva corrida puede
// arrancar ya o debe esperar en cola porque el mismo cliente ya tiene una corrida activa.
// Logica pura: no arranca nada, no escribe nada, solo decide con la lista de runs que se le
// pasa.
//
// Por que serializar por tenant: dos corridas simultaneas del mismo cliente competirian por
// el mismo perfil de navegador, la misma sesion persistida (browser-session-vault) y las
// mismas cookies — el resultado no es paralelismo, es corrupcion de sesion o postulaciones
// duplicadas. Cada tenant procesa una corrida a la vez; distintos tenants si pueden correr en
// paralelo entre si.

// Estados de run que cuentan como "todavia ocupando el turno del tenant". Coincide con el
// vocabulario que ya usa runs.mjs (running, streaming, y los blocked_* que esperan al humano
// pero no han terminado). Los terminales (completed/failed/cancelled) liberan el turno.
const DEFAULT_ACTIVE_STATUSES = new Set([
  'running',
  'streaming',
  'queued',
  'pending',
  'blocked_approval_required',
  'blocked_needs_permission',
]);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function dispatchToQueue(newRun = {}, existingRuns = [], { activeStatuses = DEFAULT_ACTIVE_STATUSES } = {}) {
  if (!isNonEmptyString(newRun.tenant_id)) {
    return { ok: false, dispatch: false, reason: 'la nueva corrida no tiene tenant_id resuelto; no se puede serializar sin saber de quien es' };
  }

  const bloqueante = existingRuns.find(
    (run) => run && run.tenant_id === newRun.tenant_id && activeStatuses.has(run.status),
  );

  if (bloqueante) {
    return {
      ok: true, dispatch: false, tenant_id: newRun.tenant_id,
      blocking_run_id: bloqueante.run_id || bloqueante.id || null,
      reason: `el tenant "${newRun.tenant_id}" ya tiene una corrida activa (${bloqueante.status}); se encola`,
    };
  }

  return {
    ok: true, dispatch: true, tenant_id: newRun.tenant_id, blocking_run_id: null,
    reason: 'sin corridas activas para este tenant; puede arrancar de inmediato',
  };
}

// Dado el estado completo de la cola, arma el orden de despacho: como mucho una corrida
// dispatchable por tenant a la vez, respetando el orden de llegada dentro de cada tenant.
export function buildDispatchPlan(pendingRuns = [], existingRuns = []) {
  const dispatched = [];
  const queued = [];
  const activeTenants = new Set(
    existingRuns.filter((run) => run && DEFAULT_ACTIVE_STATUSES.has(run.status)).map((run) => run.tenant_id),
  );

  for (const run of pendingRuns) {
    if (!isNonEmptyString(run.tenant_id)) {
      queued.push({ run, reason: 'sin tenant_id resuelto' });
      continue;
    }
    if (activeTenants.has(run.tenant_id)) {
      queued.push({ run, reason: `tenant "${run.tenant_id}" ya ocupado en esta pasada` });
      continue;
    }
    activeTenants.add(run.tenant_id);
    dispatched.push(run);
  }

  return { ok: true, dispatched, queued, total: pendingRuns.length };
}
