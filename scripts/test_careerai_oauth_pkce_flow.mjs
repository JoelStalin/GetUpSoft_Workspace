import assert from 'node:assert/strict';
import { buildAuthorizationRequest, exchangeAuthorizationCode } from '../platform/orca/src/careerai/oauth-pkce-flow.mjs';

const base = { platform: 'linkedin', tenantId: 'tenant-1', userId: 'user-1', clientId: 'client-abc', redirectUri: 'http://127.0.0.1:8788/oauth/callback' };

const req = buildAuthorizationRequest(base);
assert.equal(req.ok, true, 'arma la request de autorizacion');
assert.match(req.authorize_url, /code_challenge=/);
assert.match(req.authorize_url, /code_challenge_method=S256/);
assert.notEqual(req.code_verifier, undefined);

const unsupported = buildAuthorizationRequest({ ...base, platform: 'workday' });
assert.equal(unsupported.ok, false, 'plataforma sin OAuth2/PKCE registrado se rechaza, nunca se inventa un flujo');

const noTenant = buildAuthorizationRequest({ ...base, tenantId: undefined });
assert.equal(noTenant.ok, false, 'sin tenantId no se arma la request: el token quedaria sin aislar');

let tokenClientCalls = 0;
const tokenClient = async () => { tokenClientCalls += 1; return { access_token: 'fixture-token', refresh_token: 'fixture-refresh', expires_in: 3600 }; };

const badState = await exchangeAuthorizationCode({ platform: 'linkedin', code: 'abc', state: 'x', expectedState: 'y', codeVerifier: req.code_verifier }, { confirm: true, tokenClient });
assert.equal(badState.ok, false, 'state distinto se rechaza: posible CSRF');
assert.equal(tokenClientCalls, 0, 'nunca llama al tokenClient si el state no coincide');

const noConfirm = await exchangeAuthorizationCode({ platform: 'linkedin', code: 'abc', state: req.state, expectedState: req.state, codeVerifier: req.code_verifier }, { confirm: false, tokenClient });
assert.equal(noConfirm.ok, false, 'sin confirm:true no intercambia el codigo');
assert.equal(tokenClientCalls, 0);

const exchanged = await exchangeAuthorizationCode({ platform: 'linkedin', code: 'abc', state: req.state, expectedState: req.state, codeVerifier: req.code_verifier, clientId: base.clientId, redirectUri: base.redirectUri }, { confirm: true, tokenClient });
assert.equal(exchanged.ok, true, 'con state, verifier y confirm:true si intercambia');
assert.equal(exchanged.token_exchanged, true);
assert.equal(exchanged.refresh_token_present, true);
assert.equal(tokenClientCalls, 1);

console.log(JSON.stringify({ ok: true, node: 'oauth-pkce-flow', pkce_s256: true, state_verificado: true, aislado_por_tenant: true, intercambio_exige_confirm_true: true }));
