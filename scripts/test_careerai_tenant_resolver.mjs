import { resolveTenantId, bindTenantToRun } from '../apps/orca/src/careerai/tenant-resolver.mjs';

// --- precedencia: request > session > default ---------------------------------
const explicito = resolveTenantId({ explicit_tenant_id: 'joel', session_tenant_id: 'otro', default_tenant_id: 'dev' });
if (explicito.tenant_id !== 'joel' || explicito.source !== 'request') {
  throw new Error('El tenant explicito de la peticion debe ganar sobre sesion y default');
}

const sesion = resolveTenantId({ session_tenant_id: 'joel', default_tenant_id: 'dev' });
if (sesion.tenant_id !== 'joel' || sesion.source !== 'session') {
  throw new Error('Sin tenant explicito, debe caer al de la sesion');
}

const porDefault = resolveTenantId({ default_tenant_id: 'dev' });
if (porDefault.tenant_id !== 'dev' || porDefault.source !== 'default') {
  throw new Error('Sin request ni sesion, debe caer al default');
}

// --- ninguna fuente confiable: pausa, no inventa -------------------------------
const nada = resolveTenantId({});
if (nada.ok !== false || nada.pause !== true || nada.tenant_id !== null) {
  throw new Error('Sin ninguna fuente, debe pausar y no inventar un tenant');
}

// --- forma invalida: nunca se usa un tenant_id que pueda escapar rutas --------
const conEspacios = resolveTenantId({ explicit_tenant_id: 'joel martinez' });
if (conEspacios.ok !== false) throw new Error('Un tenant_id con espacios no es valido');

const conPathTraversal = resolveTenantId({ explicit_tenant_id: '../otro-cliente' });
if (conPathTraversal.ok !== false) throw new Error('Un tenant_id con ".." no debe aceptarse (fuga de ruta)');

const conMayusculas = resolveTenantId({ explicit_tenant_id: 'Joel' });
if (conMayusculas.ok !== false) throw new Error('El formato exige minusculas consistentes');

// La fuente invalida no debe hacer fallback silencioso a la siguiente: se pausa explicitamente.
const invalidoConFallbackDisponible = resolveTenantId({ explicit_tenant_id: '..bad', session_tenant_id: 'joel' });
if (invalidoConFallbackDisponible.ok !== false || invalidoConFallbackDisponible.source !== 'request') {
  throw new Error('Un tenant_id explicito invalido debe pausar, no saltar en silencio al de sesion');
}

// --- propagacion al run --------------------------------------------------------
const run = { id: 'run-1', status: 'started' };
const conTenant = bindTenantToRun(run, 'joel');
if (conTenant.ok !== true || conTenant.run.tenant_id !== 'joel') {
  throw new Error('Debe propagar el tenant_id al run');
}
if (run.tenant_id !== undefined) throw new Error('bindTenantToRun no debe mutar el run original');

// Reasignar el tenant de un run ya vinculado es una fuga entre clientes: se rechaza.
const runYaVinculado = { id: 'run-2', tenant_id: 'joel' };
const reasignacion = bindTenantToRun(runYaVinculado, 'otro-cliente');
if (reasignacion.ok !== false) throw new Error('No se puede reasignar el tenant de un run ya vinculado');

// Vincular el mismo tenant dos veces es idempotente, no un error.
const mismoTenant = bindTenantToRun(runYaVinculado, 'joel');
if (mismoTenant.ok !== true) throw new Error('Vincular el mismo tenant otra vez debe ser idempotente');

// tenant_id vacio nunca se propaga.
const sinTenant = bindTenantToRun(run, '');
if (sinTenant.ok !== false) throw new Error('Un tenant_id vacio no se propaga al run');

console.log(JSON.stringify({
  ok: true,
  node: 'tenant-resolver',
  precedencia: ['request', 'session', 'default'],
  rechazos_de_forma: ['espacios', 'path_traversal', 'mayusculas'],
  reasignacion_de_tenant_bloqueada: true,
}));
