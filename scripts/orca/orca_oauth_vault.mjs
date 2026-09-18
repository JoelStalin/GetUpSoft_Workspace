import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const command = process.argv[2] || 'status';
let provider = process.argv[3];
let projectId = process.argv[4] || process.env.ORCA_PROJECT_ID || 'default-project';
let userId = process.argv[5] || process.env.ORCA_USER_ID || 'default-user';
const vaultPath = path.resolve(process.env.ORCA_OAUTH_VAULT || 'data/orca/oauth-vault.enc.json');
const keyText = process.env.ORCA_OAUTH_VAULT_KEY;

if (!keyText) {
  console.error('Falta ORCA_OAUTH_VAULT_KEY. Use un secreto de 32+ caracteres fuera del repositorio.');
  process.exit(2);
}

const key = crypto.createHash('sha256').update(keyText, 'utf8').digest();
const providers = new Set(['google', 'meta', 'linkedin', 'indeed', 'gmail', 'drive']);
if (command === 'status' && provider && !providers.has(provider)) {
  userId = process.argv[4] || process.env.ORCA_USER_ID || 'default-user';
  projectId = provider;
  provider = undefined;
}
if (provider && !providers.has(provider)) throw new Error(`Proveedor no permitido: ${provider}`);

function decrypt() {
  if (!fs.existsSync(vaultPath)) return {};
  const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString('utf8'));
}
function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
  fs.writeFileSync(vaultPath, JSON.stringify({ version: 1, algorithm: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }) + '\n', { mode: 0o600 });
}

const vault = decrypt();
if (command === 'status') {
  const scope = vault[projectId]?.[userId] || {};
  console.log(JSON.stringify({ ok: true, vault: vaultPath, project_id: projectId, user_id: userId, providers: Object.keys(scope).map((name) => ({ provider: name, connected: Boolean(scope[name]?.refresh_token || scope[name]?.access_token), updated_at: scope[name]?.updated_at || null })) }));
} else if (command === 'save') {
  const payload = JSON.parse(process.env.ORCA_OAUTH_PAYLOAD || '{}');
  if (!provider || !payload.refresh_token && !payload.access_token) throw new Error('save requiere proveedor y token OAuth');
  vault[projectId] ??= {};
  vault[projectId][userId] ??= {};
  vault[projectId][userId][provider] = { ...payload, updated_at: new Date().toISOString() };
  encrypt(vault);
  console.log(JSON.stringify({ ok: true, project_id: projectId, user_id: userId, provider, saved: true, path: vaultPath }));
} else if (command === 'remove') {
  if (!provider) throw new Error('remove requiere proveedor');
  if (vault[projectId]?.[userId]) delete vault[projectId][userId][provider];
  encrypt(vault);
  console.log(JSON.stringify({ ok: true, project_id: projectId, user_id: userId, provider, removed: true }));
} else {
  throw new Error('Comando inválido: status|save|remove');
}
