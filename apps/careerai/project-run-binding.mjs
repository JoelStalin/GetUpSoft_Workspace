// Nodo project-run-binding. Asocia un run al proyecto ORCA del cliente (creado por
// orca-project-provisioner) para que aparezca en su panel de monitoreo. Logica pura: no crea
// proyectos, no escribe nada, solo decide si la asociacion es segura.
//
// Por que valida el tenant: un proyecto pertenece a un tenant especifico (su URL de monitoreo,
// su dueño). Asociar el run de un cliente al proyecto de otro cliente los mezclaria en el mismo
// panel — el mismo tipo de fuga que evita tenant-resolver, pero en el borde proyecto<->run.

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function bindRunToProject(run = {}, project = {}) {
  if (!isNonEmptyString(run.id)) {
    return { ok: false, run, reason: 'el run no tiene id; no hay nada que asociar' };
  }
  if (!isNonEmptyString(project.project_id)) {
    return { ok: false, run, reason: 'el proyecto no tiene project_id; no se puede asociar' };
  }
  if (!isNonEmptyString(project.tenant_id)) {
    return { ok: false, run, reason: 'el proyecto no declara tenant_id; no se puede verificar propiedad' };
  }

  // El run debe conocer su propio tenant antes de asociarse a un proyecto (deberia venir de
  // tenant-resolver). Sin eso, no hay forma de comprobar que el proyecto es del mismo cliente.
  if (!isNonEmptyString(run.tenant_id)) {
    return { ok: false, run, reason: 'el run no tiene tenant_id resuelto; asociar sin verificar tenant es inseguro' };
  }

  if (run.tenant_id !== project.tenant_id) {
    return {
      ok: false, run,
      reason: `el run pertenece al tenant "${run.tenant_id}" y el proyecto al tenant "${project.tenant_id}"; asociacion cruzada rechazada`,
    };
  }

  // Un run ya asociado a otro proyecto no se reasigna en silencio.
  if (run.project_id && run.project_id !== project.project_id) {
    return {
      ok: false, run,
      reason: `el run ya esta asociado al proyecto "${run.project_id}"; no se reasigna a "${project.project_id}"`,
    };
  }

  return {
    ok: true,
    run: {
      ...run,
      project_id: project.project_id,
      monitoring_url: project.monitoring_url || run.monitoring_url || null,
    },
    reason: null,
  };
}
