// Nodo oauth-pkce-flow: Nivel 2 de connection-strategy.mjs. Arma la URL de autorizacion con
// PKCE (RFC 7636) para una plataforma+tenant sin credenciales del cliente ademas del
// client_id/client_secret ya registrado de la app. El intercambio del codigo por tokens
// requiere confirm:true y un cliente HTTP inyectado (mismo patron que scheduleInterview con
// calendarClient) para poder probar sin llamar a la plataforma real.
import crypto from 'node:crypto';

const REGISTRY = {
  linkedin: { authorize: 'https://www.linkedin.com/oauth/v2/authorization', token: 'https://www.linkedin.com/oauth/v2/accessToken', scope: 'r_liteprofile' },
  google_drive: { authorize: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', scope: 'https://www.googleapis.com/auth/drive.readonly' },
  gmail: { authorize: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose' },
};

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildAuthorizationRequest({ platform, tenantId, userId, clientId, redirectUri } = {}) {
  const config = REGISTRY[String(platform || '').toLowerCase()];
  if (!config) return { ok: false, reason: `plataforma sin OAuth2/PKCE registrado: ${platform}` };
  if (!tenantId || !userId) return { ok: false, reason: 'falta tenantId o userId: el token debe quedar aislado por tenant' };
  if (!clientId) return { ok: false, reason: 'falta clientId de la app registrada' };
  if (!redirectUri) return { ok: false, reason: 'falta redirectUri' };

  const verifier = base64url(crypto.randomBytes(48));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));
  const query = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: config.scope, state, code_challenge: challenge, code_challenge_method: 'S256',
  });

  return {
    ok: true, platform, tenant_id: tenantId, user_id: userId,
    authorize_url: `${config.authorize}?${query}`,
    state, code_verifier: verifier,
    // El verifier viaja al llamador para el intercambio posterior; nunca se persiste aqui
    // ni se envia a nadie mas que a la plataforma en el intercambio real.
  };
}

export async function exchangeAuthorizationCode({ platform, code, state, expectedState, codeVerifier, clientId, clientSecret, redirectUri } = {}, { confirm = false, tokenClient } = {}) {
  const config = REGISTRY[String(platform || '').toLowerCase()];
  if (!config) return { ok: false, token_exchanged: false, reason: `plataforma sin OAuth2/PKCE registrado: ${platform}` };
  if (!code) return { ok: false, token_exchanged: false, reason: 'falta authorization code' };
  if (!state || state !== expectedState) return { ok: false, token_exchanged: false, reason: 'state no coincide: posible CSRF' };
  if (!codeVerifier) return { ok: false, token_exchanged: false, reason: 'falta code_verifier de la request original' };
  if (confirm !== true) return { ok: false, token_exchanged: false, reason: 'falta confirmacion explicita (confirm: true) para el intercambio real' };
  if (typeof tokenClient !== 'function') return { ok: false, token_exchanged: false, reason: 'falta tokenClient inyectado' };

  const result = await tokenClient({ url: config.token, code, code_verifier: codeVerifier, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri });
  if (!result?.access_token) return { ok: false, token_exchanged: false, reason: 'la plataforma no devolvio access_token' };
  return { ok: true, token_exchanged: true, platform, access_token_present: true, refresh_token_present: Boolean(result.refresh_token), expires_in: result.expires_in || null };
}
