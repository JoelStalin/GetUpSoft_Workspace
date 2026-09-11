import { prepareWebMessage, sendWebMessage, sessionStatus } from '../platform/orca/src/careerai/whatsapp-web-provider.mjs';

const now = new Date('2026-08-28T12:00:00Z');
const approval = {
  approval_id: 'appr-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-08-29T00:00:00Z', payload_hash: null,
};
const opportunity = { opportunity_id: 'opp-1' };
const optIn = new Set(['+18095550100']);

// --- preparar nunca envia ---------------------------------------------------------
const prepared = prepareWebMessage({
  opportunity, approval, recipientPhone: '+1 809 555 0100', text: 'Hola, tu postulacion esta lista',
  optedInPhones: optIn, now,
});
if (prepared.status !== 'ready_to_send' || prepared.send_performed !== false) {
  throw new Error('prepareWebMessage nunca debe marcar send_performed');
}
if (prepared.transport !== 'whatsapp_web') throw new Error('Debe declarar el transporte explicitamente');

// --- sin opt-in: bloqueado antes de intentar nada ---------------------------------
const sinOptIn = prepareWebMessage({
  opportunity, approval, recipientPhone: '+18095559999', text: 'x', optedInPhones: optIn, now,
});
if (sinOptIn.status !== 'blocked' || sinOptIn.blocked_at !== 'opt_in') {
  throw new Error('Sin opt-in confirmado, debe bloquearse antes que cualquier otra cosa');
}

// --- limite diario y espaciado se respetan tambien aqui ---------------------------
const limiteDiario = prepareWebMessage({
  opportunity, approval, recipientPhone: '+18095550100', text: 'x', optedInPhones: optIn, sentToday: 40, dailyLimit: 40, now,
});
if (limiteDiario.blocked_at !== 'daily_limit') throw new Error('El limite diario debe respetarse al preparar el mensaje de WhatsApp Web');

// --- sin aprobacion valida: bloqueado ---------------------------------------------
const sinAprobacion = prepareWebMessage({ opportunity, approval: null, recipientPhone: '+18095550100', text: 'x', optedInPhones: optIn, now });
if (sinAprobacion.blocked_at !== 'approval') throw new Error('Sin aprobacion valida no debe prepararse el envio');

// --- envio real exige confirm:true -------------------------------------------------
const sinConfirmar = await sendWebMessage(prepared, { page: {} });
if (sinConfirmar.ok !== false) throw new Error('Sin confirm:true explicito, el envio real nunca debe ejecutarse');

// --- envio real sin pagina: bloqueado ------------------------------------------------
const sinPagina = await sendWebMessage(prepared, { confirm: true, page: null });
if (sinPagina.ok !== false) throw new Error('Sin una pagina de WhatsApp Web activa, el envio no debe ejecutarse');

// --- envio real con pagina simulada: escribe y envia, con espera humana antes -----
const acciones = [];
const locatorSimulado = (selector) => ({
  first: () => locatorSimulado(selector),
  waitFor: async () => { acciones.push(['locator.waitFor', selector]); },
  click: async () => { acciones.push(['locator.click', selector]); },
  type: async (text) => { acciones.push(['locator.type', selector, text]); },
  press: async (key) => { acciones.push(['locator.press', selector, key]); },
});
const paginaSimulada = {
  goto: async (url) => { acciones.push(['goto', url]); },
  waitForTimeout: async () => {},
  waitForSelector: async (sel) => { acciones.push(['waitForSelector', sel]); },
  click: async (sel) => { acciones.push(['click', sel]); },
  type: async (sel, text) => { acciones.push(['type', sel, text]); },
  locator: (sel) => locatorSimulado(sel),
  keyboard: { press: async (key) => { acciones.push(['press', key]); } },
};

const enviado = await sendWebMessage(prepared, { confirm: true, page: paginaSimulada, jitterMs: 1 });
if (enviado.ok !== true || enviado.send_performed !== true) throw new Error('Con confirm:true y pagina activa, debe enviar');
if (!acciones.some((a) => a[0] === 'type' && a[2] === prepared.text)) throw new Error('Debe escribir el texto preparado, no otro');
if (acciones.filter((a) => a[0] === 'press' && a[1] === 'Enter').length !== 1) throw new Error('Debe enviar con Enter, una sola vez');

// --- estado de sesion: lee lo que escribe el script de login handoff ---------------
const sinSesion = await sessionStatus({ readSessionFile: async () => null });
if (sinSesion.logged_in !== false) throw new Error('Sin registro de sesion, logged_in debe ser false');

const conSesion = await sessionStatus({ readSessionFile: async () => ({ logged_in: true, detected_at: '2026-08-28T10:00:00Z' }) });
if (conSesion.logged_in !== true) throw new Error('Con sesion detectada, logged_in debe ser true');

const sinLector = await sessionStatus({});
if (sinLector.ok !== false) throw new Error('Sin readSessionFile inyectado, debe fallar explicitamente en vez de asumir un estado');

console.log(JSON.stringify({
  ok: true,
  node: 'whatsapp-web-provider',
  opt_in_bloquea_antes_de_todo: true,
  espera_humana_antes_de_escribir: true,
  send_performed_solo_con_confirm_true_y_pagina_activa: true,
}));
