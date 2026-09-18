// Nodo scraping-session-guard. Verifica que la sesion persistida (login manual del cliente en
// live browser, ver connection-strategy.mjs nivel live_browser_manual) sigue viva ANTES de
// cada accion de scraping. Logica pura: no abre el navegador, no refresca nada, solo decide
// si es seguro proceder con la sesion que se le pasa.
//
// Por que esto importa: scrapear con una sesion caducada dispara el login del portal, que en
// el mejor caso interrumpe la corrida y en el peor la confunde con actividad sospechosa
// (multiples intentos de login automatizados). Y reusar la sesion de un tenant para las
// acciones de otro es la misma fuga que ya evitan tenant-resolver y project-run-binding, asi
// que se verifica aqui tambien en el ultimo punto antes de tocar el portal.

// Sin fecha de expiracion explicita del portal, una sesion se considera obsoleta despues de
// este tiempo de inactividad y exige revalidacion antes de confiar en ella. No es un rechazo
// duro como "caducada": es "no lo sabemos con certeza, hay que comprobarlo primero".
const DEFAULT_MAX_IDLE_MS = 12 * 60 * 60 * 1000; // 12 horas

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function checkSessionAlive(session, { tenant_id, portal, now = new Date(), maxIdleMs = DEFAULT_MAX_IDLE_MS } = {}) {
  if (!session) {
    return { ok: true, alive: false, status: 'missing', reason: 'no hay sesion persistida para este portal; requiere login manual' };
  }

  if (tenant_id && session.tenant_id && session.tenant_id !== tenant_id) {
    return {
      ok: true, alive: false, status: 'tenant_mismatch',
      reason: `la sesion pertenece al tenant "${session.tenant_id}", no a "${tenant_id}"; reusarla seria una fuga entre clientes`,
    };
  }

  if (portal && session.portal && session.portal !== portal) {
    return {
      ok: true, alive: false, status: 'portal_mismatch',
      reason: `la sesion es de "${session.portal}", no de "${portal}"; no se reutiliza entre portales distintos`,
    };
  }

  const expiresAt = toDate(session.expires_at);
  if (expiresAt) {
    if (now.getTime() >= expiresAt.getTime()) {
      return { ok: true, alive: false, status: 'expired', reason: 'la sesion supero su fecha de expiracion declarada' };
    }
    return { ok: true, alive: true, status: 'alive', reason: 'sesion dentro de su ventana de expiracion declarada' };
  }

  // Sin expiracion declarada por el portal: se estima frescura por tiempo desde la captura.
  const capturedAt = toDate(session.captured_at);
  if (!capturedAt) {
    return { ok: true, alive: false, status: 'unknown_age', reason: 'la sesion no tiene captured_at ni expires_at; no se puede confiar en su antiguedad' };
  }

  const idleMs = now.getTime() - capturedAt.getTime();
  if (idleMs < 0) {
    return { ok: false, alive: false, status: 'clock_inconsistent', reason: 'captured_at es posterior a now; reloj inconsistente' };
  }
  if (idleMs > maxIdleMs) {
    return { ok: true, alive: false, status: 'stale', reason: `sesion sin verificar hace ${idleMs} ms (limite ${maxIdleMs} ms); requiere revalidacion antes de usarla` };
  }

  return { ok: true, alive: true, status: 'alive', reason: 'sesion dentro de la ventana de frescura sin expiracion declarada' };
}
