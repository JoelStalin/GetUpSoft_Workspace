import crypto from 'node:crypto';
import fs from 'node:fs';

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

const recipient = (process.argv[2] || '').replace(/\D/g, '');
const templateName = process.argv[3] || '3p_direct_integration_test_template';
const language = process.argv[4] || 'en_US';
if (!recipient) throw new Error('Recipient phone number is required in E.164 format.');

const required = [
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'META_CLIENT_SECRET',
];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}

const appSecretProof = crypto
  .createHmac('sha256', process.env.META_CLIENT_SECRET)
  .update(process.env.WHATSAPP_ACCESS_TOKEN)
  .digest('hex');

const endpoint = new URL(
  `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
);
endpoint.searchParams.set('appsecret_proof', appSecretProof);

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'template',
    template: { name: templateName, language: { code: language } },
  }),
});

const payload = await response.json();
if (!response.ok) {
  const error = payload?.error || {};
  throw new Error(JSON.stringify({
    status: response.status,
    message: error.message || `WhatsApp API ${response.status}`,
    type: error.type,
    code: error.code,
    subcode: error.error_subcode,
    user_title: error.error_user_title,
    user_message: error.error_user_msg,
    trace_id: error.fbtrace_id,
  }));
}

console.log(JSON.stringify({
  ok: true,
  recipient: payload.contacts?.[0]?.wa_id || recipient,
  message_id: payload.messages?.[0]?.id,
  status: payload.messages?.[0]?.message_status || 'accepted',
  template: templateName,
}));
