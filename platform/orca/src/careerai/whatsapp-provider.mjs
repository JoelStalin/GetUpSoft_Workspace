// Interfaz comun WhatsAppProvider y guardas anti-baneo compartidas por las dos
// implementaciones (WhatsAppWebProvider y WhatsAppCloudApiProvider). Logica pura: decide si
// es seguro enviar, nunca envia nada por si misma.
//
// Contrato WhatsAppProvider (duck typing, no hay interfaces en JS):
//   estadoSesion(): Promise<{ ok, configured, logged_in?, reason? }>
//   enviarNotificacion({ opportunity, approval, recipientPhone, text, ...guardas }): Promise<resultado>
//
// Seleccion por variable de entorno WHATSAPP_PROVIDER=web|cloud. Sin ese valor, no se asume
// un default: enviar por el proveedor equivocado (p. ej. Baileys cuando el cliente esperaba
// la Cloud API) tiene consecuencias reales (riesgo de baneo vs. costo por mensaje), asi que
// la eleccion tiene que ser explicita.
import { checkRateLimit } from './rate-limiter.mjs';

export function selectProviderName({ provider = process.env.WHATSAPP_PROVIDER } = {}) {
  const normalized = String(provider || '').toLowerCase().trim();
  if (normalized === 'web' || normalized === 'cloud') {
    return { ok: true, provider: normalized };
  }
  return {
    ok: false, provider: null,
    reason: 'WHATSAPP_PROVIDER no configurado o invalido; debe ser "web" o "cloud" explicitamente',
  };
}

// --- opt-in: nunca se escribe a un numero que no confirmo primero -------------
// El opt-in tambien es lo que evita bloqueos por spam del lado de WhatsApp: un numero que
// nunca inicio contacto y recibe mensajes de un bot es exactamente el patron que dispara
// las defensas anti-bot de Meta.
export function checkOptIn(phone, { optedInPhones = new Set() } = {}) {
  const normalized = String(phone || '').replace(/[^\d+]/g, '');
  if (!normalized) return { ok: false, allowed: false, reason: 'numero vacio o invalido' };
  if (!optedInPhones.has(normalized)) {
    return { ok: true, allowed: false, reason: `el numero ${normalized} no tiene opt-in confirmado; no se le escribe sin permiso` };
  }
  return { ok: true, allowed: true, reason: 'opt-in confirmado' };
}

// --- limite diario configurable, por defecto conservador -----------------------
const DEFAULT_DAILY_LIMIT = 40;

export function checkDailyLimit(sentToday, { dailyLimit = DEFAULT_DAILY_LIMIT } = {}) {
  const count = Number.isFinite(sentToday) ? sentToday : 0;
  if (count >= dailyLimit) {
    return { ok: true, allowed: false, reason: `limite diario alcanzado (${count}/${dailyLimit})`, remaining: 0 };
  }
  return { ok: true, allowed: true, reason: 'dentro del limite diario', remaining: dailyLimit - count };
}

// --- plan de envio: combina opt-in + limite diario + espaciado -----------------
// Punto unico que decide "puedo enviar ahora" para cualquier proveedor. No envia nada; el
// llamador usa este resultado antes de invocar al proveedor real.
export function buildSendPlan({
  phone,
  optedInPhones = new Set(),
  sentToday = 0,
  dailyLimit = DEFAULT_DAILY_LIMIT,
  lastActionAt = null,
  now = new Date(),
  minIntervalMs,
} = {}) {
  const optIn = checkOptIn(phone, { optedInPhones });
  if (!optIn.allowed) return { ok: true, allowed: false, blocked_at: 'opt_in', reason: optIn.reason };

  const daily = checkDailyLimit(sentToday, { dailyLimit });
  if (!daily.allowed) return { ok: true, allowed: false, blocked_at: 'daily_limit', reason: daily.reason };

  const spacing = checkRateLimit('whatsapp_web', { lastActionAt, now, minIntervalMs });
  if (!spacing.allowed) {
    return { ok: true, allowed: false, blocked_at: 'rate_limit', reason: spacing.reason, wait_ms: spacing.wait_ms };
  }

  return { ok: true, allowed: true, blocked_at: null, reason: 'opt-in confirmado, dentro del limite diario y del espaciado minimo' };
}
