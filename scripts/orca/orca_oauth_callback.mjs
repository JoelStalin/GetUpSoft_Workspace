import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const provider = process.argv[2];
const projectId = process.argv[3];
const userId = process.argv[4];
const code = process.env.ORCA_OAUTH_CODE;
const returnedState = process.env.ORCA_OAUTH_STATE;
const expectedState = process.env.ORCA_OAUTH_EXPECTED_STATE;
const verifier = process.env.ORCA_OAUTH_CODE_VERIFIER;
const clientId = process.env.ORCA_OAUTH_CLIENT_ID;
const clientSecret = process.env.ORCA_OAUTH_CLIENT_SECRET;
const redirectUri = process.env.ORCA_OAUTH_REDIRECT_URI || 'http://127.0.0.1:8788/oauth/callback';
const tokenUrls = {
  google: 'https://oauth2.googleapis.com/token',
  meta: 'https://graph.facebook.com/v20.0/oauth/access_token',
  linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
  indeed: process.env.INDEED_OAUTH_TOKEN_URL,
};
const tokenUrl = tokenUrls[provider];
if (!provider || !projectId || !userId || !code || !returnedState || !expectedState || !verifier || !clientId || !tokenUrl) {
  throw new Error('Callback incompleto: proveedor, proyecto, usuario, code, state, verifier, client_id y token URL son obligatorios');
}
const returnedStateBuffer = Buffer.from(returnedState);
const expectedStateBuffer = Buffer.from(expectedState);
if (returnedStateBuffer.length !== expectedStateBuffer.length || !crypto.timingSafeEqual(returnedStateBuffer, expectedStateBuffer)) throw new Error('OAuth state inválido');

const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: clientId, code_verifier: verifier });
if (clientSecret) body.set('client_secret', clientSecret);
const response = await fetch(tokenUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
const payload = await response.json();
if (!response.ok || (!payload.access_token && !payload.refresh_token)) throw new Error(`Intercambio OAuth rechazado (${response.status})`);

const safePayload = { access_token: payload.access_token, refresh_token: payload.refresh_token, token_type: payload.token_type, scope: payload.scope, expires_in: payload.expires_in };
const result = spawnSync(process.execPath, ['scripts/orca_oauth_vault.mjs', 'save', provider, projectId, userId], {
  cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, ORCA_OAUTH_PAYLOAD: JSON.stringify(safePayload) },
});
if (result.status !== 0) throw new Error(result.stderr || 'No se pudo guardar la conexión OAuth');
console.log(JSON.stringify({ ok: true, provider, project_id: projectId, user_id: userId, stored_encrypted: true, vault_result: JSON.parse(result.stdout.split('\n').filter(Boolean).at(-1)) }));
