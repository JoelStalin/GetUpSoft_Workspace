import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const text = fs.readFileSync('.env.local', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep < 1) continue;
    process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
}
loadLocalEnv();

const projectId = process.argv[2] || 'careerai';
const userId = process.argv[3] || 'yoeli';
const expectedEmail = process.argv[4] || 'joelstalin2105@gmail.com';
const vaultPath = path.resolve(process.env.ORCA_OAUTH_VAULT || 'data/orca/oauth-vault.enc.json');
const keyText = process.env.ORCA_OAUTH_VAULT_KEY;
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

const folderId = '1sJ-oDGrdOzMVtV0G3sNoAQzEw_eg1U0I';
const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size)`;

const response = await fetch(listUrl, { headers });
const payload = await response.json();
console.log('Archivos en la carpeta de CVs de Drive:');
console.log(JSON.stringify(payload, null, 2));

const downloadDir = path.resolve('data/careerai/original_cvs');
fs.mkdirSync(downloadDir, { recursive: true });

for (const file of payload.files || []) {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  const fileRes = await fetch(downloadUrl, { headers });
  if (fileRes.ok) {
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const dest = path.join(downloadDir, file.name);
    fs.writeFileSync(dest, buffer);
    console.log(`  ⬇️ Descargado CV Original: ${file.name} (${buffer.length} bytes) en ${dest}`);
  }
}
