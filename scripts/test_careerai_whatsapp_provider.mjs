import { selectProviderName, checkOptIn, checkDailyLimit, buildSendPlan } from '../apps/orca/src/careerai/whatsapp-provider.mjs';

// --- seleccion de proveedor: nunca asume un default -----------------------------
const sinConfigurar = selectProviderName({ provider: undefined });
if (sinConfigurar.ok !== false) throw new Error('Sin WHATSAPP_PROVIDER configurado, no debe asumir un proveedor por defecto');

const web = selectProviderName({ provider: 'web' });
if (web.ok !== true || web.provider !== 'web') throw new Error('WHATSAPP_PROVIDER=web debe seleccionar el proveedor web');

const cloud = selectProviderName({ provider: 'CLOUD' });
if (cloud.ok !== true || cloud.provider !== 'cloud') throw new Error('Debe aceptar mayusculas/minusculas');

const invalido = selectProviderName({ provider: 'baileys-directo' });
if (invalido.ok !== false) throw new Error('Un valor no reconocido no debe aceptarse silenciosamente');

// --- opt-in: nunca se escribe sin permiso confirmado -----------------------------
const optIn = new Set(['+18095550100']);
const conOptIn = checkOptIn('+1 809 555 0100', { optedInPhones: optIn });
if (conOptIn.allowed !== true) throw new Error('Un numero con opt-in confirmado debe permitirse');

const sinOptIn = checkOptIn('+18095559999', { optedInPhones: optIn });
if (sinOptIn.allowed !== false) throw new Error('Un numero sin opt-in nunca debe permitirse, aunque haya aprobacion de negocio');

const numeroVacio = checkOptIn('', { optedInPhones: optIn });
if (numeroVacio.ok !== false) throw new Error('Un numero vacio debe fallar explicitamente');

// --- limite diario configurable ---------------------------------------------------
const dentroDelLimite = checkDailyLimit(10, { dailyLimit: 40 });
if (dentroDelLimite.allowed !== true || dentroDelLimite.remaining !== 30) throw new Error('Dentro del limite debe permitir y reportar el restante');

const limiteAlcanzado = checkDailyLimit(40, { dailyLimit: 40 });
if (limiteAlcanzado.allowed !== false) throw new Error('Al llegar al limite diario debe bloquear');

const limiteConservadorPorDefecto = checkDailyLimit(41);
if (limiteConservadorPorDefecto.allowed !== false) throw new Error('El limite por defecto debe ser conservador (40), no ilimitado');

// --- plan de envio: combina opt-in + limite + espaciado --------------------------
const now = new Date('2026-08-28T12:00:00Z');

const planSinOptIn = buildSendPlan({ phone: '+18095559999', optedInPhones: optIn, now });
if (planSinOptIn.allowed !== false || planSinOptIn.blocked_at !== 'opt_in') {
  throw new Error('Sin opt-in, el plan debe bloquear en la etapa opt_in');
}

const planLimiteDiario = buildSendPlan({ phone: '+18095550100', optedInPhones: optIn, sentToday: 40, dailyLimit: 40, now });
if (planLimiteDiario.allowed !== false || planLimiteDiario.blocked_at !== 'daily_limit') {
  throw new Error('Al llegar al limite diario, el plan debe bloquear en esa etapa');
}

const planEspaciado = buildSendPlan({
  phone: '+18095550100', optedInPhones: optIn,
  lastActionAt: new Date('2026-08-28T11:59:55Z'), now, // 5s antes, whatsapp_web exige 15s
});
if (planEspaciado.allowed !== false || planEspaciado.blocked_at !== 'rate_limit') {
  throw new Error('Sin el espaciado minimo transcurrido, el plan debe bloquear en rate_limit');
}
if (!planEspaciado.wait_ms || planEspaciado.wait_ms <= 0) throw new Error('Debe reportar cuanto falta para poder enviar');

const planPermitido = buildSendPlan({
  phone: '+18095550100', optedInPhones: optIn,
  lastActionAt: new Date('2026-08-28T11:59:00Z'), now, // 60s antes, ya paso el minimo
});
if (planPermitido.allowed !== true) throw new Error('Con opt-in, dentro del limite y el espaciado ya transcurrido, el plan debe permitir');

console.log(JSON.stringify({
  ok: true,
  node: 'whatsapp-provider',
  seleccion_sin_default_implicito: true,
  opt_in_obligatorio: true,
  limite_diario_por_defecto: 40,
  reutiliza_rate_limiter_para_espaciado: true,
}));
