import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.env.ORCA_ROOT || process.cwd());
const vaultPath = path.resolve(process.env.ORCA_PROVIDER_VAULT || path.join(root, 'data/orca/provider-credentials.enc.json'));
const keyPath = path.resolve(process.env.ORCA_PROVIDER_KEY_FILE || path.join(root, 'data/orca/.provider-credential.key'));
const definitions = {
  nvidia: { name: 'NVIDIA NIM', env: 'NVIDIA_API_KEY', icon: '🟩', models: 'https://integrate.api.nvidia.com/v1/models' },
  openai: { name: 'OpenAI', env: 'OPENAI_API_KEY', icon: '🟢', models: 'https://api.openai.com/v1/models' },
  anthropic: { name: 'Anthropic Claude', env: 'ANTHROPIC_API_KEY', icon: '🟠', models: 'https://api.anthropic.com/v1/models' },
  gemini: { name: 'Google Gemini', env: 'GEMINI_API_KEY', icon: '🟦', models: 'https://generativelanguage.googleapis.com/v1beta/models' },
};

function masterKey() {
  const configured = process.env.ORCA_PROVIDER_VAULT_KEY || process.env.ORCA_OAUTH_VAULT_KEY;
  if (configured) return crypto.createHash('sha256').update(configured).digest();
  fs.mkdirSync(path.dirname(keyPath), { recursive: true });
  if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, crypto.randomBytes(32), { mode: 0o600 });
  return crypto.createHash('sha256').update(fs.readFileSync(keyPath)).digest();
}
function readVault() {
  if (!fs.existsSync(vaultPath)) return {};
  const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString('utf8'));
}
function writeVault(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
  fs.writeFileSync(vaultPath, JSON.stringify({ version: 1, algorithm: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }) + '\n', { mode: 0o600 });
}
function requireProvider(provider) {
  if (!definitions[provider]) throw new Error('unsupported_provider');
  return definitions[provider];
}
export function providerCredentialStatus() {
  const vault = readVault();
  return Object.entries(definitions).map(([id, definition]) => ({ id, name: definition.name, icon: definition.icon, configured: Boolean(vault[id]?.token || process.env[definition.env]), status: vault[id]?.status || (process.env[definition.env] ? 'configured' : 'disconnected'), last_verified: vault[id]?.last_verified || null, updated_at: vault[id]?.updated_at || null }));
}
export function saveProviderCredential(provider, token) {
  const definition = requireProvider(provider);
  if (typeof token !== 'string' || token.trim().length < 8) throw new Error('invalid_credential');
  const vault = readVault();
  vault[provider] = { token: token.trim(), status: 'configured', updated_at: new Date().toISOString(), last_verified: vault[provider]?.last_verified || null };
  writeVault(vault);
  process.env[definition.env] = token.trim();
  return { provider, configured: true, status: 'configured', reconnect_applied: true };
}
export function removeProviderCredential(provider) {
  const definition = requireProvider(provider); const vault = readVault();
  delete vault[provider]; delete process.env[definition.env]; writeVault(vault);
  return { provider, configured: false, status: 'disconnected' };
}
export async function testProviderCredential(provider) {
  const definition = requireProvider(provider); const vault = readVault();
  const token = vault[provider]?.token || process.env[definition.env];
  if (!token) throw new Error('credential_not_configured');
  const url = provider === 'gemini' ? `${definition.models}?key=${encodeURIComponent(token)}` : definition.models;
  const headers = provider === 'anthropic' ? { 'x-api-key': token, 'anthropic-version': '2023-06-01' } : provider === 'gemini' ? {} : { authorization: `Bearer ${token}` };
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
  vault[provider] = { ...(vault[provider] || { token }), status: response.ok ? 'connected' : 'error', last_verified: new Date().toISOString(), updated_at: vault[provider]?.updated_at || new Date().toISOString(), last_error: response.ok ? null : `HTTP ${response.status}` };
  writeVault(vault);
  return { provider, connected: response.ok, status: response.ok ? 'connected' : 'error', http_status: response.status, last_verified: vault[provider].last_verified };
}
