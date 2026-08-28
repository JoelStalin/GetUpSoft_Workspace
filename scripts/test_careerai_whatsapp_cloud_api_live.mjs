// Prueba REAL (no mock) del proveedor Cloud API a traves de la interfaz comun. Envia un
// mensaje de verdad al numero pasado como argumento (formato E.164 sin '+', p.ej. 18492600983).
// Requiere WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en .env.local.
import fs from 'node:fs';
import { prepareCloudApiMessage, sendCloudApiMessage, sendCloudApiTemplate, cloudApiStatus } from '../apps/orca/src/careerai/whatsapp-cloud-api.mjs';

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

const recipient = process.argv[2];
if (!recipient) throw new Error('Uso: node scripts/test_careerai_whatsapp_cloud_api_live.mjs <numero_E164_sin_mas>');

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
