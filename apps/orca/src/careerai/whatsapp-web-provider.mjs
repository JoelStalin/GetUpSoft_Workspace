// WhatsAppWebProvider: automatiza web.whatsapp.com con un perfil de Chromium persistente
// (Playwright), igual que careerai_login_handoff.mjs para LinkedIn/Indeed. El usuario
// escanea el QR una vez en `scripts/careerai_whatsapp_login_handoff.mjs`; esta sesion queda
// persistida en su propio directorio de perfil.
//
// *** RIESGO REAL: esto NO es la API oficial de WhatsApp. ***
// Automatizar WhatsApp Web viola los Terminos de Servicio de WhatsApp. Investigacion 2026
// sobre deteccion de automatizacion: baneo tipico del numero en 2-8 semanas, sin patron
// predecible, sin aviso previo. Ver docs/whatsapp.md para el detalle completo y la
// recomendacion de usar un numero SECUNDARIO, nunca el numero personal del usuario.
//
// Mitigaciones aplicadas (reducen el riesgo, no lo eliminan):
//   - opt-in obligatorio (ver whatsapp-provider.mjs: checkOptIn)
//   - limite diario configurable (ver checkDailyLimit)
//   - espaciado minimo entre envios + jitter aleatorio (ver checkRateLimit + randomJitterMs)
//   - nunca rafagas: un mensaje a la vez, con presencia "escribiendo..." antes de enviar
//
// `page` se inyecta (duck typing: solo necesita .fill/.click/.waitForSelector/.type) para
// que la logica de armado del mensaje se pueda probar sin abrir un navegador real.
import { checkApproval } from './guards.mjs';
import { buildSendPlan } from './whatsapp-provider.mjs';

const randomJitterMs = (min = 800, max = 2500) => Math.floor(min + Math.random() * (max - min));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '');
}

// --- estado de sesion: lee el archivo que escribe el script de login handoff ---
export async function sessionStatus({ readSessionFile } = {}) {
  if (typeof readSessionFile !== 'function') {
    return { ok: false, configured: false, reason: 'falta readSessionFile: no hay forma de consultar el estado sin tocar disco desde aqui' };
  }
  const record = await readSessionFile();
  if (!record) return { ok: true, configured: true, logged_in: false, reason: 'sin sesion registrada; requiere login manual (escanear QR)' };
  return { ok: true, configured: true, logged_in: record.logged_in === true, detected_at: record.detected_at || null };
}

// --- prepara la decision de envio (opt-in + limite diario + espaciado) --------
// Igual que prepareCloudApiMessage / prepareWhatsAppMessage: nunca envia, solo decide.
export function prepareWebMessage({
  opportunity,
  approval,
  recipientPhone,
  text,
  optedInPhones = new Set(),
  sentToday = 0,
  dailyLimit,
  lastActionAt = null,
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return { ok: false, status: 'blocked', blocked_at: 'input', reason: 'falta opportunity_id', send_performed: false };
  if (!recipientPhone) return { ok: false, status: 'blocked', blocked_at: 'input', reason: 'no hay numero destino', send_performed: false };
  if (!text) return { ok: false, status: 'blocked', blocked_at: 'input', reason: 'falta el texto del mensaje', send_performed: false };

  const phone = normalizePhone(recipientPhone);

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, now });
  if (!approvalCheck.valid) {
    return { ok: false, status: 'blocked', blocked_at: 'approval', reason: 'aprobacion no valida', approval_reasons: approvalCheck.reasons, send_performed: false };
  }

  const plan = buildSendPlan({ phone, optedInPhones, sentToday, dailyLimit, lastActionAt, now });
  if (!plan.allowed) {
    return { ok: true, status: 'blocked', blocked_at: plan.blocked_at, reason: plan.reason, wait_ms: plan.wait_ms || null, send_performed: false };
  }

  return {
    ok: true,
    status: 'ready_to_send',
    transport: 'whatsapp_web',
    channel: 'whatsapp',
    opportunity_id: opportunity.opportunity_id,
    recipient_phone: phone,
    text,
    approval_id: approval?.approval_id || null,
    send_performed: false,
  };
}

// --- envio real: exige confirm:true + una pagina de WhatsApp Web ya con sesion activa ---
// `page` es el objeto pagina de Playwright (o un mock con la misma forma en tests).
export async function sendWebMessage(prepared, { confirm = false, page = null, jitterMs = randomJitterMs } = {}) {
  if (!prepared?.ok || prepared.status !== 'ready_to_send') {
    return { ok: false, send_performed: false, reason: 'nada preparado y listo para enviar', prepared };
  }
  if (confirm !== true) {
    return { ok: false, send_performed: false, reason: 'falta confirmacion explicita (confirm: true) para el envio real' };
  }
  if (!page) {
    return { ok: false, send_performed: false, reason: 'falta la pagina de WhatsApp Web con sesion activa' };
  }

  try {
    // Nunca en rafaga: espera humana antes de cada envio, con presencia visible si el
    // driver la soporta (best-effort, no rompe si no existe en el mock de test).
    await wait(typeof jitterMs === 'function' ? jitterMs() : jitterMs);

    await page.goto(`https://web.whatsapp.com/send?phone=${encodeURIComponent(prepared.recipient_phone)}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const inputSelector = 'div[contenteditable="true"][data-tab="10"]';
    await page.waitForSelector(inputSelector, { timeout: 30000 });
    await page.click(inputSelector);
    await page.type(inputSelector, prepared.text, { delay: 30 });
    await page.keyboard.press('Enter');

    return {
      ok: true,
      send_performed: true,
      opportunity_id: prepared.opportunity_id,
      approval_id: prepared.approval_id,
      recipient_phone: prepared.recipient_phone,
      sent_at: new Date().toISOString(),
    };
  } catch (error) {
    return { ok: false, send_performed: false, reason: String(error?.message || error) };
  }
}
