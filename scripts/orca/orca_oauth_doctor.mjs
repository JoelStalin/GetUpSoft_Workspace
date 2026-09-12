import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const envFile of [path.join(root, '.env.local'), path.join(root, 'apps', 'orca', '.env.local')]) {
  if (!fs.existsSync(envFile)) continue;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const providers = {
  google: process.env.GOOGLE_OAUTH_CLIENT_KIND === 'desktop'
    ? ['GOOGLE_OAUTH_CLIENT_ID']
    : ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'],
  meta: ['META_APP_ID', 'META_CLIENT_SECRET'],
  linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  indeed: ['INDEED_CLIENT_ID', 'INDEED_CLIENT_SECRET', 'INDEED_OAUTH_AUTHORIZE_URL', 'INDEED_OAUTH_TOKEN_URL'],
};
const redirectUri = process.env.ORCA_OAUTH_REDIRECT_URI || 'http://127.0.0.1:8788/oauth/callback';
const result = Object.fromEntries(Object.entries(providers).map(([provider, keys]) => {
  const missing = keys.filter((key) => !process.env[key]);
  const providerRedirectUri = process.env[`${provider.toUpperCase()}_OAUTH_REDIRECT_URI`] || redirectUri;
  return [provider, { ready: missing.length === 0 && Boolean(process.env.ORCA_OAUTH_VAULT_KEY), missing, redirect_uri: providerRedirectUri, vault_key_configured: Boolean(process.env.ORCA_OAUTH_VAULT_KEY) }];
}));
console.log(JSON.stringify({ ok: true, service: 'orca-oauth', redirect_uri: redirectUri, providers: result }, null, 2));
