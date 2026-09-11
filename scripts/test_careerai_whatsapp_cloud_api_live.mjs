// Prueba REAL (no mock) del proveedor Cloud API a traves de la interfaz comun. Envia un
// mensaje de verdad al numero pasado como argumento (formato E.164 sin '+', p.ej. 18492600983).
// Requiere WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en .env.local.
import fs from 'node:fs';
import { prepareCloudApiMessage, sendCloudApiMessage, sendCloudApiTemplate, cloudApiStatus } from '../platform/orca/src/careerai/whatsapp-cloud-api.mjs';

function loadLocalEnv() {
  const text = fs.readFileSync('.env.local', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadLocalEnv();

// Numero de prueba configurable (nunca hardcodeado): WHATSAPP_TEST_NUMBER en .env.local o
// primer argumento del CLI. Normaliza a E.164 asumiendo NANP (+1) si llega sin prefijo de
// pais y con 10 digitos — el numero de prueba acordado (8492600983, Rep. Dominicana) entra
// asi sin que haga falta escribir el "+1" en cada invocacion.
function normalizeTestNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

const recipientE164 = normalizeTestNumber(process.argv[2] || process.env.WHATSAPP_TEST_NUMBER);
if (!recipientE164) throw new Error('Uso: node scripts/test_careerai_whatsapp_cloud_api_live.mjs [numero] (o define WHATSAPP_TEST_NUMBER en .env.local)');
// La Cloud API de Meta espera el campo "to" SIN el "+" inicial (solo digitos con codigo de
// pais). Se guarda el E.164 completo para logging/trazabilidad y se pasa sin "+" a la API.
const recipient = recipientE164.replace(/^\+/, '');
console.log(JSON.stringify({ step: 'recipient_normalized', e164: recipientE164, sent_as: recipient }));

const status = await cloudApiStatus();
console.log(JSON.stringify({ step: 'status', ...status }));

const opportunity = { opportunity_id: 'live-smoke-test' };
const approval = {
  approval_id: 'live-smoke-approval',
  opportunity_id: 'live-smoke-test',
  status: 'approved',
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  payload_hash: null,
};

const prepared = prepareCloudApiMessage({
  opportunity, approval, recipientPhone: recipient,
  text: 'Prueba real de CareerAI (Cloud API oficial): si ves esto, el envio de texto libre funciona dentro de la ventana de servicio.',
  allowlistPhones: [recipient],
});
console.log(JSON.stringify({ step: 'prepared', ...prepared }));

if (prepared.status !== 'ready_to_send') {
  console.log(JSON.stringify({ step: 'stopped', reason: 'no quedo listo para enviar, ver arriba' }));
  process.exit(0);
}

const sent = await sendCloudApiMessage(prepared, { confirm: true });
console.log(JSON.stringify({ step: 'sent_text', ...sent }));

// Camino de plantilla: el unico que funciona FUERA de la ventana de servicio de 24h (el
// caso normal de CareerAI, que notifica sin que el cliente haya escrito primero).
const preparedTemplate = prepareCloudApiMessage({
  opportunity: { opportunity_id: 'live-smoke-test-template' },
  approval: { ...approval, opportunity_id: 'live-smoke-test-template' },
  recipientPhone: recipient,
  text: '[plantilla 3p_direct_integration_test_template]',
  allowlistPhones: [recipient],
});
const sentTemplate = await sendCloudApiTemplate(preparedTemplate, {
  templateName: process.argv[3] || '3p_direct_integration_test_template',
  languageCode: process.argv[4] || 'en_US',
  confirm: true,
});
console.log(JSON.stringify({ step: 'sent_template', ...sentTemplate }));
