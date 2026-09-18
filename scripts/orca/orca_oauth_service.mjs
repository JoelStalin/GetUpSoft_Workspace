import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

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

const port = Number(process.env.ORCA_OAUTH_PORT || 8788);
const defaultRedirectUri = process.env.ORCA_OAUTH_REDIRECT_URI || `http://127.0.0.1:${port}/oauth/callback`;
const providerRedirectUri = (provider) =>
  process.env[`${provider.toUpperCase()}_OAUTH_REDIRECT_URI`] || defaultRedirectUri;
const pending = new Map();
const eventLogPath = path.resolve('data/orca/oauth-events.jsonl');
const whatsappEventLogPath = path.resolve('data/orca/whatsapp-events.jsonl');
const whatsappQueuePath = path.resolve('data/orca/whatsapp-hermes-queue.jsonl');
const providerConfig = {
  google: ['https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 'GOOGLE_OAUTH_CLIENT_ID', process.env.GOOGLE_OAUTH_SCOPES || 'openid email profile', 'GOOGLE_OAUTH_CLIENT_SECRET'],
  meta: ['https://www.facebook.com/v20.0/dialog/oauth', 'https://graph.facebook.com/v20.0/oauth/access_token', 'META_APP_ID', process.env.META_OAUTH_SCOPES || 'public_profile,email', 'META_CLIENT_SECRET'],
  linkedin: ['https://www.linkedin.com/oauth/v2/authorization', 'https://www.linkedin.com/oauth/v2/accessToken', 'LINKEDIN_CLIENT_ID', process.env.LINKEDIN_OAUTH_SCOPES || 'openid profile email', 'LINKEDIN_CLIENT_SECRET'],
  indeed: [process.env.INDEED_OAUTH_AUTHORIZE_URL, process.env.INDEED_OAUTH_TOKEN_URL, 'INDEED_CLIENT_ID', process.env.INDEED_OAUTH_SCOPES || 'openid profile', 'INDEED_CLIENT_SECRET'],
};
let hermesWorkerRunning = false;

function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); }
function logEvent(event) {
  fs.mkdirSync(path.dirname(eventLogPath), { recursive: true });
  fs.appendFileSync(eventLogPath, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
}
function parse(req) { return new URL(req.url, defaultRedirectUri); }
function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('request_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function appendJsonLine(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`);
}
function verifyMetaSignature(rawBody, signature) {
  const secret = process.env.META_CLIENT_SECRET;
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const supplied = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  return supplied.length === calculated.length && crypto.timingSafeEqual(supplied, calculated);
}
function normalizeWhatsAppEvents(payload) {
  const events = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const message of value.messages || []) {
        events.push({
          event_id: message.id,
          kind: 'message',
          from: message.from,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body || null,
          phone_number_id: value.metadata?.phone_number_id || null,
          raw_message: message,
        });
      }
      for (const status of value.statuses || []) {
        events.push({
          event_id: `${status.id}:${status.status}`,
          kind: 'status',
          message_id: status.id,
          recipient_id: status.recipient_id,
          status: status.status,
          timestamp: status.timestamp,
          errors: status.errors || [],
        });
      }
    }
  }
  return events;
}
function triggerHermesWorker() {
  if (hermesWorkerRunning) return;
  hermesWorkerRunning = true;
  const child = spawn(process.execPath, ['scripts/orca_whatsapp_hermes_worker.mjs'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.once('close', () => { hermesWorkerRunning = false; });
  child.once('error', () => { hermesWorkerRunning = false; });
}
function start(url) {
  const provider = url.searchParams.get('provider');
  const projectId = url.searchParams.get('project_id');
  const userId = url.searchParams.get('user_id');
  const cfg = providerConfig[provider];
  if (!cfg || !projectId || !userId || !cfg[0]) return { error: 'provider, project_id y user_id son obligatorios' };
  const clientId = process.env[cfg[2]];
  if (!clientId) return { error: `Falta ${cfg[2]} en el entorno autorizado` };
  const state = crypto.randomBytes(32).toString('base64url');
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  pending.set(state, { provider, projectId, userId, verifier, createdAt: Date.now() });
  const redirectUri = providerRedirectUri(provider);
  const query = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: cfg[3], state, code_challenge: challenge, code_challenge_method: 'S256' });
  return { ok: true, provider, project_id: projectId, user_id: userId, authorize_url: `${cfg[0]}?${query}`, expires_in_seconds: 600 };
}
async function callback(url) {
  const state = url.searchParams.get('state');
  const entry = state && pending.get(state);
  if (!entry || Date.now() - entry.createdAt > 600000) return { error: 'OAuth state inválido o expirado' };
  pending.delete(state);
  const cfg = providerConfig[entry.provider];
  const clientId = process.env[cfg[2]];
  const redirectUri = providerRedirectUri(entry.provider);
  const body = new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code') || '', redirect_uri: redirectUri, client_id: clientId, code_verifier: entry.verifier });
  if (cfg[4] && process.env[cfg[4]]) body.set('client_secret', process.env[cfg[4]]);
  const response = await fetch(cfg[1], { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  const token = await response.json();
  if (!response.ok || !token.access_token && !token.refresh_token) {
    const reason = [token.error, token.error_description].filter(Boolean).join(': ').replace(/[\r\n]/g, ' ').slice(0, 300);
    logEvent({ provider: entry.provider, project_id: entry.projectId, user_id: entry.userId, outcome: 'token_exchange_failed', status: response.status, reason });
    return { error: `Intercambio rechazado (${response.status})${reason ? ` — ${reason}` : ''}` };
  }
  const saved = spawnSync(process.execPath, ['scripts/orca_oauth_vault.mjs', 'save', entry.provider, entry.projectId, entry.userId], { encoding: 'utf8', env: { ...process.env, ORCA_OAUTH_PAYLOAD: JSON.stringify({ access_token: token.access_token, refresh_token: token.refresh_token, token_type: token.token_type, scope: token.scope, expires_in: token.expires_in }) } });
  if (saved.status !== 0) return { error: 'No se pudo guardar la conexión cifrada' };
  logEvent({ provider: entry.provider, project_id: entry.projectId, user_id: entry.userId, outcome: 'connected' });
  return { ok: true, provider: entry.provider, project_id: entry.projectId, user_id: entry.userId, stored_encrypted: true };
}
const server = http.createServer(async (req, res) => {
  try {
    const url = parse(req);
    if (req.method === 'GET' && url.pathname === '/oauth/start') return json(res, 200, start(url));
    if (req.method === 'GET' && url.pathname === '/oauth/callback') {
      const result = await callback(url);
      res.writeHead(result.ok ? 200 : 400, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(result.ok ? 'ORCA OAuth conectado. Puedes cerrar esta ventana.' : `ORCA OAuth error: ${result.error}`);
    }
    if (req.method === 'GET' && url.pathname === '/webhooks/whatsapp') {
      const valid = url.searchParams.get('hub.mode') === 'subscribe'
        && url.searchParams.get('hub.verify_token') === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      if (!valid) return json(res, 403, { error: 'webhook_verification_failed' });
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end(url.searchParams.get('hub.challenge') || '');
    }
    if (req.method === 'POST' && url.pathname === '/webhooks/whatsapp') {
      const rawBody = await readBody(req);
      if (!verifyMetaSignature(rawBody, req.headers['x-hub-signature-256'])) {
        return json(res, 401, { error: 'invalid_meta_signature' });
      }
      const payload = JSON.parse(rawBody.toString('utf8'));
      const events = normalizeWhatsAppEvents(payload);
      let queuedMessages = 0;
      for (const event of events) {
        const envelope = { at: new Date().toISOString(), source: 'meta-whatsapp', ...event };
        appendJsonLine(whatsappEventLogPath, envelope);
        if (event.kind === 'message') {
          appendJsonLine(whatsappQueuePath, envelope);
          queuedMessages += 1;
        }
      }
      if (queuedMessages > 0) triggerHermesWorker();
      return json(res, 200, { ok: true, accepted: events.length });
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/workflow' || url.pathname === '/debug')) {
      const { HTML_DASHBOARD } = await import('./orca_web_dashboard.mjs');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(HTML_DASHBOARD);
    }
    if (req.method === 'GET' && url.pathname === '/api/status') {
      const { getWorkflowControlState } = await import('./orca_unified_orchestrator.mjs');
      return json(res, 200, getWorkflowControlState());
    }
    if (req.method === 'POST' && url.pathname === '/api/run') {
      const { executeUnifiedRun } = await import('./orca_unified_orchestrator.mjs');
      executeUnifiedRun({ debug: true });
      return json(res, 200, { ok: true, message: 'run_triggered' });
    }
    if (req.method === 'POST' && url.pathname === '/api/stop') {
      const { updateWorkflowControlState } = await import('./orca_unified_orchestrator.mjs');
      updateWorkflowControlState({ status: 'stopped' });
      return json(res, 200, { ok: true, message: 'workflow_stopped' });
    }
    if (req.method === 'POST' && (url.pathname === '/api/careerai/runs' || url.pathname.endsWith('/run'))) {
      const { startRun } = await import('../apps/careerai/runs.mjs');
      let bodyData = {};
      try {
        const raw = await readBody(req);
        if (raw.length) bodyData = JSON.parse(raw.toString('utf8'));
      } catch {}
      const run = startRun({
        tenant_id: bodyData.tenant_id || 'default',
        provider: bodyData.provider || 'indeed',
        execute_workflow: true,
        execute_delegations: true,
      });
      return json(res, 200, { execution_id: run.run_id, ...run });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/careerai/runs/')) {
      const parts = url.pathname.split('/');
      const runId = decodeURIComponent(parts[4] || '');
      const subAction = parts[5];
      const { getRun } = await import('../apps/careerai/runs.mjs');
      const run = getRun(runId);
      if (!run) return json(res, 404, { error: 'run_not_found', run_id: runId });
      return json(res, 200, run);
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/careerai/runs/') && url.pathname.endsWith('/stop')) {
      const parts = url.pathname.split('/');
      const runId = decodeURIComponent(parts[4] || '');
      const { stopRun } = await import('../apps/careerai/runs.mjs');
      const stopped = stopRun(runId);
      return json(res, 200, stopped || { ok: false, error: 'run_not_found' });
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/careerai/runs/') && url.pathname.endsWith('/resume')) {
      const parts = url.pathname.split('/');
      const runId = decodeURIComponent(parts[4] || '');
      const { resumeRun } = await import('../apps/careerai/runs.mjs');
      const resumed = resumeRun(runId);
      return json(res, 200, resumed || { ok: false, error: 'run_not_found' });
    }
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'orca-oauth', pending: pending.size });
    return json(res, 404, { error: 'not_found' });
  } catch (error) { return json(res, 500, { error: 'oauth_service_error', message: error.message }); }
});
server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ ok: true, service: 'orca-oauth-and-dashboard', port, redirect_uri: defaultRedirectUri })));
