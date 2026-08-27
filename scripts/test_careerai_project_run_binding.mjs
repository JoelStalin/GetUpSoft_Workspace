import { bindRunToProject } from '../apps/orca/src/careerai/project-run-binding.mjs';

const run = { id: 'run-1', tenant_id: 'joel' };
const project = { project_id: 'proj-joel-careerai', tenant_id: 'joel', monitoring_url: 'https://orca.local/projects/proj-joel-careerai' };

// --- caso feliz: mismo tenant --------------------------------------------------
const ok = bindRunToProject(run, project);
if (ok.ok !== true || ok.run.project_id !== 'proj-joel-careerai') {
  throw new Error('Debe asociar el run al proyecto cuando ambos son del mismo tenant');
}
if (ok.run.monitoring_url !== project.monitoring_url) throw new Error('Debe propagar la URL de monitoreo');
if (run.project_id !== undefined) throw new Error('bindRunToProject no debe mutar el run original');

// --- asociacion cruzada entre tenants: rechazada -------------------------------
const proyectoDeOtro = { project_id: 'proj-otro-cliente', tenant_id: 'otro-cliente', monitoring_url: 'https://orca.local/x' };
const cruzado = bindRunToProject(run, proyectoDeOtro);
if (cruzado.ok !== false) throw new Error('No se puede asociar el run de un tenant al proyecto de otro');
if (!/tenant/.test(cruzado.reason)) throw new Error('El motivo del rechazo debe mencionar el tenant');

// --- run sin tenant_id resuelto: inseguro verificar, se rechaza ---------------
const sinTenant = bindRunToProject({ id: 'run-2' }, project);
if (sinTenant.ok !== false) throw new Error('Sin tenant_id en el run no se puede verificar propiedad del proyecto');

// --- proyecto incompleto: no hay nada que asociar ------------------------------
const sinProjectId = bindRunToProject(run, { tenant_id: 'joel' });
if (sinProjectId.ok !== false) throw new Error('Un proyecto sin project_id no puede asociarse');

const sinTenantEnProyecto = bindRunToProject(run, { project_id: 'proj-x' });
if (sinTenantEnProyecto.ok !== false) throw new Error('Un proyecto sin tenant_id declarado no puede verificarse');

// --- reasignacion silenciosa bloqueada -----------------------------------------
const runYaAsociado = { id: 'run-3', tenant_id: 'joel', project_id: 'proj-viejo' };
const reasignacion = bindRunToProject(runYaAsociado, project);
if (reasignacion.ok !== false) throw new Error('No se puede reasignar un run ya asociado a otro proyecto en silencio');

// Volver a asociar al mismo proyecto es idempotente.
const runYaAsociadoMismo = { id: 'run-4', tenant_id: 'joel', project_id: 'proj-joel-careerai' };
const idempotente = bindRunToProject(runYaAsociadoMismo, project);
if (idempotente.ok !== true) throw new Error('Re-asociar al mismo proyecto debe ser idempotente');

console.log(JSON.stringify({
  ok: true,
  node: 'project-run-binding',
  verifica_tenant_cruzado: true,
  reasignacion_silenciosa_bloqueada: true,
  idempotente_mismo_proyecto: true,
}));
