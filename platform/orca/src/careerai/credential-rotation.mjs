// Nodo credential-rotation. Decide que hacer con un token OAuth2 antes de que caduque: nada,
// refrescarlo (si hay refresh_token), o re-autorizar desde cero (si no lo hay o el refresh ya
// fallo). Logica pura: devuelve un PLAN, igual que ats-adapters — no llama al proveedor OAuth,
// no escribe el token nuevo en ningun vault. Ejecutar el refresco real es responsabilidad de
// otro paso que consume este plan.
//
// Por que se adelanta al vencimiento: refrescar un token ya caducado en medio de una corrida
// interrumpe lo que se estaba haciendo. Refrescar con margen (antes de que caduque) evita esa
// interrupcion sin necesidad de reintentar a mitad de una accion.

const DEFAULT_REFRESH_BEFORE_MS = 5 * 60 * 1000; // refrescar 5 minutos antes de vencer

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function decideRotation(credential = {}, { now = new Date(), refreshBeforeMs = DEFAULT_REFRESH_BEFORE_MS } = {}) {
  if (!credential.oauth_token) {
    return {
      ok: true, action: 'reauthorize', reason: 'no hay token almacenado; se requiere autorizacion inicial del cliente',
    };
  }

  const expiresAt = toDate(credential.oauth_expires_at);
  if (!expiresAt) {
    // Sin fecha de expiracion declarada, no se puede decidir si hace falta refrescar: se
    // trata como si el token siguiera vigente, pero se señala para revision (no se inventa
    // una fecha de vencimiento que el proveedor nunca declaro).
    return { ok: true, action: 'none', reason: 'el token no declara expires_at; no se puede calcular vencimiento', needs_review: true };
  }

  const msHastaVencer = expiresAt.getTime() - now.getTime();

  if (msHastaVencer > refreshBeforeMs) {
    return { ok: true, action: 'none', reason: 'el token sigue vigente fuera de la ventana de refresco', expires_in_ms: msHastaVencer };
  }

  if (credential.refresh_token) {
    return {
      ok: true, action: 'refresh',
      reason: msHastaVencer <= 0 ? 'el token ya vencio; se refresca con el refresh_token disponible' : 'el token entra a la ventana de refresco',
      expires_in_ms: Math.max(0, msHastaVencer),
    };
  }

  // Vencido (o por vencer) y sin refresh_token: no hay forma de renovarlo sin intervencion
  // del cliente.
  return {
    ok: true, action: 'reauthorize',
    reason: msHastaVencer <= 0 ? 'el token vencio y no hay refresh_token; requiere re-autorizacion del cliente' : 'el token esta por vencer y no hay refresh_token; requiere re-autorizacion antes de que expire',
    expires_in_ms: Math.max(0, msHastaVencer),
  };
}
