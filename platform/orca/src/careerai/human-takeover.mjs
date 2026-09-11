// Nodo human-takeover: decide CEDER el control al humano ante login manual, captcha o
// checkpoint — nunca intenta esquivarlo. Reusa la misma deteccion de bloqueo que ya usan los
// nodos de discovery (detectBlocked en job-discovery-core.mjs) para no duplicar el criterio,
// y agrega la decision de pausa/notificacion, que es lo que este nodo aporta de nuevo: nunca
// escribe una credencial, nunca hace click "a ver si pasa el captcha".
import { detectBlocked } from './job-discovery-core.mjs';

export function decideHumanTakeover({ url, bodyText, sessionId, reason, now = new Date() } = {}) {
  if (!sessionId) return { ok: false, reason: 'falta sessionId: no se puede pausar una sesion sin identificarla' };

  const blocked = detectBlocked(url, bodyText);
  const manualReason = reason && !blocked ? reason : null;

  if (!blocked && !manualReason) {
    return { ok: true, takeover_required: false, status: 'no_blocker_detected' };
  }

  return {
    ok: true,
    takeover_required: true,
    status: 'ceded_to_human',
    session_id: sessionId,
    detected_at: now.toISOString(),
    reason: manualReason || 'checkpoint/captcha/verificacion detectado en el portal',
    // Contrato explicito: este nodo nunca actua sobre la pagina. Solo describe el pedido de
    // cesion para que el runner pause el flujo automatico y notifique al humano.
    automated_action_taken: false,
    resume_condition: 'el humano resuelve el login/captcha manualmente y confirma que la sesion quedo activa',
  };
}

// Cuando el humano confirma que resolvio el bloqueo, esto valida que el pedido de takeover
// que se esta cerrando es el mismo que se abrio (mismo sessionId), para no confundir sesiones.
export function resolveHumanTakeover({ takeoverRequest, sessionId, resolvedByHumanAt = new Date() } = {}) {
  if (!takeoverRequest?.takeover_required) return { ok: false, reason: 'no hay un takeover abierto para resolver' };
  if (takeoverRequest.session_id !== sessionId) return { ok: false, reason: 'sessionId no coincide con el takeover abierto' };
  return { ok: true, status: 'resumed', session_id: sessionId, resolved_at: resolvedByHumanAt.toISOString() };
}
