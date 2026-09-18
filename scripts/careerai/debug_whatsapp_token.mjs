import fs from 'node:fs';
import crypto from 'node:crypto';

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  if (!line || line.trimStart().startsWith('#')) continue;
  const separator = line.indexOf('=');
  if (separator < 1) continue;
  const key = line.slice(0, separator).trim();
  const value = line.slice(separator + 1).trim();
  if (!(key in process.env)) process.env[key] = value;
}

const appAccessToken = `${process.env.META_APP_ID}|${process.env.META_CLIENT_SECRET}`;
const endpoint = new URL('https://graph.facebook.com/v25.0/debug_token');
endpoint.searchParams.set('input_token', process.env.WHATSAPP_ACCESS_TOKEN);
endpoint.searchParams.set('access_token', appAccessToken);

const response = await fetch(endpoint);
const payload = await response.json();
if (!response.ok) throw new Error(payload?.error?.message || `Graph API ${response.status}`);

const data = payload.data || {};
const proof = crypto.createHmac('sha256', process.env.META_CLIENT_SECRET)
  .update(process.env.WHATSAPP_ACCESS_TOKEN)
  .digest('hex');
const checks = {};
for (const [name, id] of [
  ['phone_number', process.env.WHATSAPP_PHONE_NUMBER_ID],
  ['business_account', process.env.WHATSAPP_BUSINESS_ACCOUNT_ID],
]) {
  const checkUrl = new URL(`https://graph.facebook.com/v25.0/${id}`);
  if (name === 'phone_number') {
    checkUrl.searchParams.set('fields', 'display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,throughput,is_official_business_account');
  } else {
    checkUrl.searchParams.set('fields', 'name,account_review_status,business_verification_status,currency,timezone_id');
  }
  checkUrl.searchParams.set('access_token', process.env.WHATSAPP_ACCESS_TOKEN);
  checkUrl.searchParams.set('appsecret_proof', proof);
  const checkResponse = await fetch(checkUrl);
  const checkPayload = await checkResponse.json();
  checks[name] = checkResponse.ok
    ? { ok: true, ...checkPayload }
    : { ok: false, status: checkResponse.status, code: checkPayload?.error?.code, message: checkPayload?.error?.message };
}
const templatesUrl = new URL(`https://graph.facebook.com/v25.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`);
templatesUrl.searchParams.set('fields', 'name,status,language');
templatesUrl.searchParams.set('limit', '50');
templatesUrl.searchParams.set('access_token', process.env.WHATSAPP_ACCESS_TOKEN);
templatesUrl.searchParams.set('appsecret_proof', proof);
const templatesResponse = await fetch(templatesUrl);
const templatesPayload = await templatesResponse.json();
checks.templates = templatesResponse.ok
  ? (templatesPayload.data || []).map(({ name, status, language }) => ({ name, status, language }))
  : { ok: false, status: templatesResponse.status, code: templatesPayload?.error?.code, message: templatesPayload?.error?.message };
console.log(JSON.stringify({
  app_id: data.app_id,
  is_valid: data.is_valid,
  expires_at: data.expires_at,
  data_access_expires_at: data.data_access_expires_at,
  scopes: data.scopes || [],
  granular_scopes: data.granular_scopes || [],
  user_id: data.user_id,
  checks,
}, null, 2));
