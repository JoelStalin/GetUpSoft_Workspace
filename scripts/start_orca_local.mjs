import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareOnly, connectorGates } from '../apps/orca/src/careerai/prepare-only.mjs';
import { indeedStatus } from '../apps/orca/src/careerai/indeed-provider.mjs';
import { linkedinStatus } from '../apps/orca/src/careerai/linkedin-provider.mjs';
import { startRun, listRuns, getRun, liveBrowserSession } from '../apps/orca/src/careerai/runs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'apps', 'orca', 'workflow-editor', 'dist');
const blueprintPath = path.join(root, 'apps', 'orca', 'data', 'workflow_blueprints.json');
const port = Number(process.env.ORCA_UI_PORT || 4173);
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error(`ORCA dist no encontrado: ${dist}`);
const careerBlueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8')).find((item) => item.id === 'careerai-indeed-agent');
for (const envFile of [path.join(root, '.env.local'), path.join(root, 'apps', 'orca', '.env.local')]) {
  if (!fs.existsSync(envFile)) continue;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const oauth = spawn(process.execPath, [path.join(root, 'scripts', 'orca_oauth_service.mjs')], { cwd: root, stdio: 'inherit', detached: false, env: process.env });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
function json(res, payload) { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(payload)); }
function updateLocalEnv(updates) {
  const envPath = path.join(root, '.env.local');
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const pendingUpdates = new Map(Object.entries(updates));
  const seen = new Set();
  const lines = existing.split(/\r?\n/).map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match || !pendingUpdates.has(match[1])) return line;
    seen.add(match[1]);
    return `${match[1]}=${pendingUpdates.get(match[1])}`;
  });
  for (const [key, value] of pendingUpdates) if (!seen.has(key)) lines.push(`${key}=${value}`);
  const temporaryPath = `${envPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${lines.filter((line, index, all) => line || index < all.length - 1).join('\n')}\n`, { mode: 0o600 });
  fs.renameSync(temporaryPath, envPath);
}
const ui = http.createServer((req, res) => {
  const apiPath = (req.url || '').split('?')[0];
  if (apiPath === '/oauth') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(`<!doctype html><meta charset="utf-8"><title>ORCA OAuth</title><style>body{font:16px system-ui;background:#0b0c12;color:#eee;max-width:680px;margin:60px auto;padding:0 20px}label{display:block;margin:14px 0 6px}input,select,button{font:inherit;padding:10px;border-radius:8px;border:1px solid #555;background:#171923;color:#eee;width:100%}button{margin-top:20px;background:#6d5dfc;border:0;cursor:pointer}a{display:block;margin-top:20px;color:#b7aaff;word-break:break-all}</style><h1>ORCA OAuth</h1><p>Autenticación visible por proveedor. Los tokens se guardan cifrados por proyecto y usuario.</p><label>Proveedor</label><select id="provider"><option>google</option><option>meta</option><option>linkedin</option><option>indeed</option></select><label>ID del proyecto</label><input id="project" placeholder="project-id"><label>ID del usuario</label><input id="user" placeholder="user-id"><button id="connect" type="button">Preparar OAuth</button><p id="status"></p><a id="authorize" hidden target="_blank" rel="noreferrer">Abrir proveedor OAuth</a><script>document.getElementById('connect').addEventListener('click',async function(){const p=document.getElementById('provider').value,pr=encodeURIComponent(document.getElementById('project').value.trim()),u=encodeURIComponent(document.getElementById('user').value.trim()),s=document.getElementById('status'),a=document.getElementById('authorize');if(!pr||!u){s.textContent='Completa proyecto y usuario';return}s.textContent='Preparando sesión segura...';const response=await fetch('/oauth/start?provider='+encodeURIComponent(p)+'&project_id='+pr+'&user_id='+u);const data=await response.json();if(!data.ok){s.textContent=data.error||'No se pudo preparar OAuth';return}a.href=data.authorize_url;a.hidden=false;a.textContent='Abrir proveedor OAuth en Chrome';s.textContent='Sesión PKCE lista. Revisa el proveedor antes de continuar.'})</script>`);
  }
  if (apiPath === '/oauth/start') {
    const target = `http://127.0.0.1:${process.env.ORCA_OAUTH_PORT || 8788}${req.url}`;
    return fetch(target).then(async (response) => json(res, await response.json())).catch((error) => json(res, { error: 'oauth_service_unreachable', message: error.message }));
  }
  if (apiPath === '/oauth/configure-provider' && req.method === 'POST') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 8192) req.destroy();
    });
    return req.on('end', () => {
      try {
        const payload = JSON.parse(raw || '{}');
        const secretKeys = {
          meta: 'META_CLIENT_SECRET',
          linkedin: 'LINKEDIN_CLIENT_SECRET',
          whatsapp: 'WHATSAPP_ACCESS_TOKEN',
          whatsapp_webhook: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
        };
        const key = secretKeys[payload.provider];
        if (!key || typeof payload.secret !== 'string' || payload.secret.length < 8) {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ ok: false, error: 'invalid_provider_or_secret' }));
        }
        updateLocalEnv({ [key]: payload.secret });
        return json(res, { ok: true, provider: payload.provider, configured: true, restart_required: true });
      } catch {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: 'invalid_request' }));
      }
    });
  }
  if (apiPath === '/api/health') return json(res, { ok: true, service: 'orca-local' });
  if (apiPath === '/api/stats') return json(res, { ok: true, workflows: 1, nodes: 15, edges: 16 });
  if (apiPath === '/api/pipeline/stats') return json(res, { ok: true, status: 'ready', active: 0, completed: 0, failed: 0 });
  if (apiPath === '/api/hermes/doctor') return json(res, { ok: true, status: process.env.HERMES_API_KEY ? 'configured' : 'requires_configuration' });
  if (apiPath === '/api/hermes/memory' || apiPath === '/api/hermes/audit' || apiPath === '/api/orca/evidence') return json(res, { ok: true, data: [] });
  if (apiPath === '/api/prompts/index') return json(res, { ok: true, items: [] });
  if (apiPath === '/api/n8n/node-types') return json(res, { ok: true, data: [] });
  if (apiPath === '/api/n8n/workflows') {
    const nodes = (careerBlueprint?.nodes || []).map((node, index) => ({ id: node.id, name: node.label, type: node.type, position: [index * 220, 120], parameters: { label: node.label }, data: node }));
    const connections = {};
    for (const edge of careerBlueprint?.edges || []) (connections[edge.from] ||= []).push({ node: edge.to, type: 'main', index: 0 });
    return json(res, { ok: true, data: [{ id: careerBlueprint.id, name: careerBlueprint.name, active: false, nodes, connections, settings: careerBlueprint.settings, orca_meta: { source: 'careerai-blueprint' } }] });
  }
  if (apiPath.startsWith('/api/n8n/workflows/') && apiPath.endsWith('/run') && req.method === 'POST') {
    const runNodes = (careerBlueprint?.nodes || []).map((node, index) => ({ nodeId: node.id, status: node.type === 'action' ? 'blocked_approval_required' : 'completed', sequence: index + 1 }));
    return json(res, { ok: true, execution_id: `prepare-${Date.now()}`, workflow_id: careerBlueprint?.id, mode: 'prepare-only', status: 'completed_with_gate', submit_performed: false, notifications_sent: false, nodes: runNodes, evidence: ['workflow_loaded', 'nodes_validated', 'approval_gate_verified', 'external_submit_blocked'] });
  }
  if (apiPath === '/api/careerai/runs' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    return req.on('end', () => {
      let payload = {};
      try { payload = body ? JSON.parse(body) : {}; } catch { payload = {}; }
      try {
        return json(res, startRun(payload));
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: error.code || 'run_start_failed' }));
      }
    });
  }
  if (apiPath === '/api/careerai/runs') return json(res, { ok: true, runs: listRuns() });
  if (apiPath.startsWith('/api/careerai/runs/')) {
    const [runId, section] = apiPath.replace('/api/careerai/runs/', '').split('/');
    const run = getRun(runId);
    if (!run) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'unknown_run', run_id: runId }));
    }
    if (section === 'stream') {
      res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive' });
      for (const step of run.steps) res.write(`event: step
data: ${JSON.stringify({ run_id: run.run_id, ...step })}

`);
      res.write(`event: live_browser
data: ${JSON.stringify(run.live_browser)}

`);
      return res.end();
    }
    if (section === 'screenshot') return json(res, { ok: true, run_id: run.run_id, capture_mode: 'on_demand', submit_performed: false, evidence_path: `task-ledger/evidence/careerai/${run.run_id}` });
    return json(res, run);
  }
  if (apiPath === '/api/careerai/live-browser') {
    const params = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams;
    const runId = params.get('run_id');
    const run = runId ? getRun(runId) : listRuns(1)[0];
    if (!run) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'no_active_run' }));
    }
    try {
      return json(res, liveBrowserSession(run.run_id, params.get('provider') || run.provider));
    } catch (error) {
      res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: error.code || 'live_browser_failed' }));
    }
  }
  if (apiPath === '/api/careerai/connectors') {
    return json(res, { ok: true, connector_gates: connectorGates(), indeed: indeedStatus(), linkedin: linkedinStatus() });
  }
  if (apiPath === '/api/careerai/prepare-only') {
    const fixture = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams.get('fixture') || 'indeed-remote-valid';
    try {
      return json(res, prepareOnly(fixture));
    } catch (error) {
      res.writeHead(error.code === 'UNKNOWN_FIXTURE' ? 404 : 500, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: error.code || 'prepare_only_failed' }));
    }
  }
  if (apiPath === '/api/prompts/query' && req.method === 'POST') return json(res, { ok: true, review: { status: 'ready_for_human_review', submission_allowed: false } });
  if (apiPath.startsWith('/api/')) {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: false, error: 'unknown_endpoint', path: apiPath }));
  }
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = requested === '/' ? '/index.html' : requested;
  const target = path.resolve(dist, `.${relative}`);
  if (!target.startsWith(path.resolve(dist))) { res.writeHead(403); return res.end('Forbidden'); }
  const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(dist, 'index.html');
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
ui.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ ok: true, orca_ui: `http://127.0.0.1:${port}/?workflow=careerai-indeed-agent`, oauth: `http://127.0.0.1:${process.env.ORCA_OAUTH_PORT || 8788}/health` })));
function stop() { ui.close(); oauth.kill('SIGTERM'); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
