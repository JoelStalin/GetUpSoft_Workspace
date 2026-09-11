// Nodo tenant-resolver. Resuelve el tenant_id de una corrida y lo propaga al run. Logica pura:
// no toca disco ni red, no inventa un tenant cuando no hay uno confiable.
//
// Por que esto es sensible: tenant_id decide de que cliente son los CVs, credenciales y
// oportunidades que se leen y escriben. Resolver mal el tenant_id no es un bug cosmetico, es
// una fuga de datos entre clientes. Por eso el modulo nunca "adivina": si no hay una fuente
// confiable, pausa.

// Orden de precedencia: el tenant declarado explicitamente en la peticion manda siempre sobre
// cualquier valor heredado de una sesion o conexion previa, y ese sobre un default de un solo
// tenant (solo util en desarrollo local de un unico cliente).
const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;

function normalize(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isValidShape(tenantId) {
  // Un tenant_id termina formando parte de rutas de archivo y claves de vault: no puede traer
  // espacios, mayusculas inconsistentes, ni separadores de ruta (`/`, `..`) que permitirian
  // escapar del directorio del tenant.
  return TENANT_ID_PATTERN.test(tenantId);
}

export function resolveTenantId({ explicit_tenant_id, session_tenant_id, default_tenant_id } = {}) {
  const candidates = [
    { value: normalize(explicit_tenant_id), source: 'request' },
    { value: normalize(session_tenant_id), source: 'session' },
    { value: normalize(default_tenant_id), source: 'default' },
  ];

  for (const candidate of candidates) {
    if (!candidate.value) continue;
    if (!isValidShape(candidate.value)) {
      return {
        ok: false, tenant_id: null, source: candidate.source, pause: true,
        reason: `tenant_id "${candidate.value}" de la fuente "${candidate.source}" tiene forma invalida; no se usa`,
      };
    }
    return { ok: true, tenant_id: candidate.value, source: candidate.source, pause: false, reason: null };
  }

  // Ninguna fuente confiable: inventar un tenant por defecto mezclaria datos entre clientes.
  return {
    ok: false, tenant_id: null, source: null, pause: true,
    reason: 'no se pudo resolver tenant_id desde ninguna fuente confiable; se requiere revision humana',
  };
}

export function bindTenantToRun(run = {}, tenantId) {
  if (!tenantId || !isValidShape(String(tenantId))) {
    return { ok: false, run, reason: 'tenant_id invalido o vacio; no se propaga al run' };
  }

  // Un run que ya trae un tenant_id distinto es una senal de mezcla entre clientes: se rechaza
  // en vez de sobrescribir en silencio.
  if (run.tenant_id && run.tenant_id !== tenantId) {
    return {
      ok: false, run,
      reason: `el run ya pertenece al tenant "${run.tenant_id}"; no se reasigna a "${tenantId}"`,
    };
  }

  return { ok: true, run: { ...run, tenant_id: tenantId }, reason: null };
}
