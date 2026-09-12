import fs from 'node:fs';
import path from 'node:path';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Uso: node scripts/import_google_oauth_credentials.mjs <credentials.json>');

const source = JSON.parse(fs.readFileSync(path.resolve(sourcePath), 'utf8'));
const credentials = source.installed || source.web;
if (!credentials?.client_id || !credentials?.client_secret) {
  throw new Error('El archivo no contiene client_id/client_secret de Google OAuth');
}

const envPath = path.resolve('.env.local');
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const updates = new Map([
  ['GOOGLE_OAUTH_CLIENT_ID', credentials.client_id],
  ['GOOGLE_OAUTH_CLIENT_SECRET', credentials.client_secret],
  ['GOOGLE_OAUTH_CLIENT_KIND', source.installed ? 'desktop' : 'web'],
]);

const seen = new Set();
const lines = existing.split(/\r?\n/).map((line) => {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
  if (!match || !updates.has(match[1])) return line;
  seen.add(match[1]);
  return `${match[1]}=${updates.get(match[1])}`;
});
for (const [key, value] of updates) {
  if (!seen.has(key)) lines.push(`${key}=${value}`);
}

const temporaryPath = `${envPath}.tmp`;
fs.writeFileSync(temporaryPath, `${lines.filter((line, index, all) => line || index < all.length - 1).join('\n')}\n`, { mode: 0o600 });
fs.renameSync(temporaryPath, envPath);
console.log(JSON.stringify({ ok: true, imported: [...updates.keys()], destination: envPath }));
