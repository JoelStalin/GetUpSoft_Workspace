// Nodo whatsapp-summary: compone un resumen periodico (cuantas postulaciones, respuestas,
// entrevistas) y lo prepara para WhatsApp reusando prepareWhatsAppMessage — mismas guardas de
// allowlist e idempotencia que ya tiene ese modulo, en vez de reimplementarlas. Draft-only:
// jamas envia, solo compone el texto y lo deja listo_to_send.
import { prepareWhatsAppMessage } from './whatsapp.mjs';

export function buildSummaryText({ periodLabel, applicationsCount = 0, responsesCount = 0, interviewsCount = 0 } = {}) {
  const lines = [
    `Resumen CareerAI — ${periodLabel || 'periodo actual'}`,
    `Postulaciones preparadas: ${applicationsCount}`,
    `Respuestas recibidas: ${responsesCount}`,
    `Entrevistas agendadas: ${interviewsCount}`,
  ];
  return lines.join('\n');
}

export function prepareWhatsAppSummary({
  opportunity,
  approval,
  recipientPhone,
  allowlistPhones = [],
  sentKeys = new Set(),
  summary,
  now = new Date(),
} = {}) {
  if (!summary) return { ok: false, status: 'blocked', blocked_at: 'input', reason: 'falta el resumen a enviar', send_performed: false };
  const text = buildSummaryText(summary);
  return prepareWhatsAppMessage({ opportunity, approval, recipientPhone, text, allowlistPhones, sentKeys, now });
}
