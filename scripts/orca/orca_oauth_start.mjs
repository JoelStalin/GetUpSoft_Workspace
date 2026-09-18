import crypto from 'node:crypto';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith('#')) continue;
      const sep = line.indexOf('=');
      if (sep < 1) continue;
      process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }
}
loadLocalEnv();

const provider = process.argv[2];
const projectId = process.argv[3] || process.env.ORCA_PROJECT_ID || 'default-project';
const userId = process.argv[4] || process.env.ORCA_USER_ID || 'default-user';
const configs = {
  google: { authorize: 'https://accounts.google.com/o/oauth2/v2/auth', client: 'GOOGLE_OAUTH_CLIENT_ID', scope: process.env.GOOGLE_OAUTH_SCOPES || 'openid email profile' },
  meta: { authorize: 'https://www.facebook.com/v20.0/dialog/oauth', client: 'META_APP_ID', scope: process.env.META_OAUTH_SCOPES || 'public_profile,email' },
  linkedin: { authorize: 'https://www.linkedin.com/oauth/v2/authorization', client: 'LINKEDIN_CLIENT_ID', scope: process.env.LINKEDIN_OAUTH_SCOPES || 'openid profile email' },
  indeed: { authorize: process.env.INDEED_OAUTH_AUTHORIZE_URL, client: 'INDEED_CLIENT_ID', scope: process.env.INDEED_OAUTH_SCOPES || 'openid profile' },
};
const cfg = configs[provider];
if (!cfg) throw new Error(`Proveedor no soportado: ${provider || '(falta)'}`);
const clientId = process.env[cfg.client];
const redirectUri = process.env.ORCA_OAUTH_REDIRECT_URI || 'http://127.0.0.1:8788/oauth/callback';
if (!clientId || !cfg.authorize) throw new Error(`Falta configuración de ${provider}: ${cfg.client}`);

const state = crypto.randomBytes(32).toString('base64url');
const verifier = crypto.randomBytes(48).toString('base64url');
const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
const query = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: cfg.scope, state, code_challenge: challenge, code_challenge_method: 'S256' });
console.log(JSON.stringify({ ok: true, provider, project_id: projectId, user_id: userId, authorize_url: `${cfg.authorize}?${query}`, state, redirect_uri: redirectUri, next: 'Open authorize_url in the visible ORCA/Chrome browser; never paste credentials into the CLI.' }, null, 2));

if (process.env.ORCA_OAUTH_WAIT !== '1') process.exit(0);
const server = http.createServer((req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== new URL(redirectUri).pathname) return void res.end('Not found');
  if (url.searchParams.get('state') !== state) { res.statusCode = 400; return void res.end('Invalid OAuth state'); }
  const code = url.searchParams.get('code');
  res.end(code ? 'OAuth received. You may close this window.' : 'OAuth did not return a code.');
  console.log(JSON.stringify({ ok: Boolean(code), provider, project_id: projectId, user_id: userId, authorization_code_received: Boolean(code), code_verifier: verifier }));
  server.close();
});
server.listen(new URL(redirectUri).port || 80, new URL(redirectUri).hostname);
