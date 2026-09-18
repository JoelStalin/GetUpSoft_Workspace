import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const projectId = process.argv[2] || 'careerai';
const userId = process.argv[3] || 'yoeli';
const expectedEmail = process.argv[4] || 'joelstalin2105@gmail.com';
const vaultPath = path.resolve(process.env.ORCA_OAUTH_VAULT || 'data/orca/oauth-vault.enc.json');
const keyText = process.env.ORCA_OAUTH_VAULT_KEY;
if (!keyText) throw new Error('Falta ORCA_OAUTH_VAULT_KEY');

const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
const key = crypto.createHash('sha256').update(keyText, 'utf8').digest();
const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
const vault = JSON.parse(Buffer.concat([
  decipher.update(Buffer.from(envelope.data, 'base64')),
  decipher.final(),
]).toString('utf8'));
const token = vault[projectId]?.[userId]?.google?.access_token;
const grantedScopes = vault[projectId]?.[userId]?.google?.scope || '';
if (!token) throw new Error('No existe conexión Google para el proyecto/usuario');

const headers = { authorization: `Bearer ${token}` };
const checks = {
  userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
  calendar: 'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1',
  drive: 'https://www.googleapis.com/drive/v3/about?fields=user',
};

const results = {};
for (const [name, url] of Object.entries(checks)) {
  const response = await fetch(url, { headers });
  const payload = await response.json().catch(() => ({}));
  results[name] = {
    ok: response.ok,
    status: response.status,
    account_match: name === 'userinfo' ? payload.email === expectedEmail : undefined,
  };
}
results.gmail = {
  ok: grantedScopes.split(/\s+/).includes('https://www.googleapis.com/auth/gmail.send'),
  scope_granted: 'gmail.send',
  send_performed: false,
};
console.log(JSON.stringify({ ok: Object.values(results).every((item) => item.ok), project_id: projectId, user_id: userId, results }, null, 2));
