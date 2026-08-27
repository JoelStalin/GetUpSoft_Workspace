import { dispatchToQueue, buildDispatchPlan } from '../apps/orca/src/careerai/queue-dispatcher.mjs';

// --- sin corridas activas: despacha de inmediato -------------------------------
const libre = dispatchToQueue({ tenant_id: 'joel' }, []);
if (libre.dispatch !== true) throw new Error('Sin corridas previas, la nueva debe despachar de inmediato');

// --- ya hay una corrida activa del mismo tenant: se encola ---------------------
const existentes = [{ run_id: 'run-1', tenant_id: 'joel', status: 'running' }];
const ocupado = dispatchToQueue({ tenant_id: 'joel' }, existentes);
if (ocupado.dispatch !== false || ocupado.blocking_run_id !== 'run-1') {
  throw new Error('Con una corrida running del mismo tenant, debe encolar y nombrar la corrida que bloquea');
}

// --- estados bloqueantes intermedios (streaming, blocked_*) tambien encolan ----
for (const status of ['streaming', 'blocked_approval_required', 'blocked_needs_permission', 'pending', 'queued']) {
  const resultado = dispatchToQueue({ tenant_id: 'joel' }, [{ run_id: 'r', tenant_id: 'joel', status }]);
  if (resultado.dispatch !== false) throw new Error(`El estado "${status}" debe seguir bloqueando el turno del tenant`);
}

// --- estados terminales liberan el turno ---------------------------------------
for (const status of ['completed', 'failed', 'cancelled']) {
  const resultado = dispatchToQueue({ tenant_id: 'joel' }, [{ run_id: 'r', tenant_id: 'joel', status }]);
  if (resultado.dispatch !== true) throw new Error(`El estado terminal "${status}" debe liberar el turno`);
}

// --- distintos tenants no se bloquean entre si ----------------------------------
const otroTenant = dispatchToQueue({ tenant_id: 'otro-cliente' }, existentes);
if (otroTenant.dispatch !== true) throw new Error('Una corrida activa de un tenant no debe bloquear a otro tenant');

// --- sin tenant_id: no se puede serializar sin saber de quien es ---------------
const sinTenant = dispatchToQueue({}, existentes);
if (sinTenant.ok !== false) throw new Error('Sin tenant_id la nueva corrida no puede evaluarse');

// --- plan de despacho: como mucho una corrida por tenant por pasada ------------
const pendientes = [
  { id: 'p1', tenant_id: 'joel' },
  { id: 'p2', tenant_id: 'joel' }, // mismo tenant, segunda: debe quedar encolada esta pasada
  { id: 'p3', tenant_id: 'otro-cliente' },
];
const plan = buildDispatchPlan(pendientes, []);
if (plan.dispatched.length !== 2) throw new Error('Debe despachar como mucho una corrida por tenant por pasada');
if (!plan.dispatched.some((r) => r.id === 'p1') || !plan.dispatched.some((r) => r.id === 'p3')) {
  throw new Error('Debe despachar p1 (primero de joel) y p3 (unico de otro-cliente)');
}
if (plan.queued.length !== 1 || plan.queued[0].run.id !== 'p2') {
  throw new Error('p2 debe quedar encolado por compartir tenant con p1 ya despachado en esta pasada');
}

console.log(JSON.stringify({
  ok: true,
  node: 'queue-dispatcher',
  serializa_por_tenant: true,
  distintos_tenants_en_paralelo: true,
  estados_terminales_liberan_turno: ['completed', 'failed', 'cancelled'],
}));
