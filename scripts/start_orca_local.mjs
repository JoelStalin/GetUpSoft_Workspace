import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareOnly, connectorGates } from '../apps/orca/src/careerai/prepare-only.mjs';
import { indeedStatus } from '../apps/orca/src/careerai/indeed-provider.mjs';
import { linkedinStatus } from '../apps/orca/src/careerai/linkedin-provider.mjs';
import { startRun, listRuns, getRun, liveBrowserSession, stopRun, resumeRun } from '../apps/orca/src/careerai/runs.mjs';
import { saveBrowserSession, getReusableBrowserSession, revokeBrowserSession } from '../apps/orca/src/careerai/browser-session-vault.mjs';
import { hermesDoctor } from '../apps/orca/src/careerai/hermes-doctor.mjs';
import { layoutGraph } from '../apps/orca/src/careerai/graph-layout.mjs';
import { runPipeline } from '../apps/orca/src/careerai/pipeline.mjs';
import { getExecutionData, getNodeExecutionData, pinNodeData, unpinNodeData, clearExecutionData, clearPinnedData } from '../apps/orca/src/careerai/execution-debug.mjs';
import { delegationSnapshot } from '../apps/orca/src/careerai/llm-council.mjs';
import { providerCredentialStatus, saveProviderCredential, removeProviderCredential, testProviderCredential } from '../apps/orca/src/security/provider-credential-vault.mjs';
import { mergeWorkflowState } from '../apps/orca/src/runtime/workflow-state-merge.mjs';

// Registro de proyectos por cliente. La URL de monitoreo apuntaba a un puerto 5174 donde
// nunca hubo nada escuchando: el script generaba el enlace pero ningun servidor lo servia.
function loadProjectLinks() {
  // Se resuelve al llamar, no al cargar el modulo: `root` se define mas abajo.
  const file = path.resolve('data/orca/project-links.json');
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'apps', 'orca', 'workflow-editor', 'dist');
const blueprintPath = path.join(root, 'apps', 'orca', 'data', 'workflow_blueprints.json');
const nodeInventoryPath = path.join(root, 'data', 'careerai', 'node-inventory.json');
const nodeParityPath = path.join(root, 'data', 'careerai', 'n8n-node-parity.json');
const n8nCatalogPath = path.join(root, 'data', 'orca', 'n8n-node-catalog.json');
const workflowStateDir = path.join(root, 'data', 'orca', 'workflow-state');
const port = Number(process.env.ORCA_UI_PORT || 4173);
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error(`ORCA dist no encontrado: ${dist}`);
const careerBlueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8')).find((item) => item.id === 'careerai-indeed-agent');
const nodeInventory = JSON.parse(fs.readFileSync(nodeInventoryPath, 'utf8'));
const nodeParity = JSON.parse(fs.readFileSync(nodeParityPath, 'utf8'));
const n8nCatalog = fs.existsSync(n8nCatalogPath) ? JSON.parse(fs.readFileSync(n8nCatalogPath, 'utf8')) : null;
const inventoryById = new Map(nodeInventory.nodes.map((node) => [node.id, node]));
const parityById = new Map(nodeParity.nodes.map((node) => [node.node_id, node]));
const careerLayoutNodes = (careerBlueprint?.nodes || []).map((node) => ({ ...node, ...(inventoryById.get(node.id) || {}), n8n_parity: parityById.get(node.id) || null }));
const featuredNodeTypes = {
  'n8n-nodes-base.whatsApp': { label: 'WhatsApp Business', color: '#25D366', description: 'Enviar mensajes, plantillas y solicitudes de aprobación por WhatsApp.', category: 'Messaging' },
  'n8n-nodes-base.gmail': { label: 'Gmail', color: '#EA4335', description: 'Enviar y organizar correo mediante Gmail.', category: 'Messaging' },
  'orca-nodes-ai.nvidiaNim': { label: 'NVIDIA NIM', color: '#76B900', description: 'Análisis acelerado con modelos NVIDIA NIM.', category: 'AI Providers' },
  'orca-nodes-ai.hermes': { label: 'Hermes Agent', color: '#8B5CF6', description: 'Delegar razonamiento y memoria al agente Hermes.', category: 'AI Providers' },
  'orca-nodes-ai.gemini': { label: 'Google Gemini', color: '#4285F4', description: 'Análisis multimodal con Gemini.', category: 'AI Providers' },
  'orca-nodes-ai.claude': { label: 'Claude', color: '#D97757', description: 'Revisión y razonamiento con Claude.', category: 'AI Providers' },
  'orca-nodes-ai.openai': { label: 'OpenAI', color: '#10A37F', description: 'Generación y evaluación con modelos OpenAI.', category: 'AI Providers' },
  'orca-nodes-knowledge.edx': { label: 'GetUpSoft + edX Knowledge', color: '#B51F2E', description: 'Contexto curado de aprendizaje y carreras desde edX.', category: 'Knowledge' },
  'orca-nodes-jobs.indeed': { label: 'Indeed Jobs', color: '#2557A7', description: 'Buscar y preparar oportunidades de Indeed de forma segura.', category: 'Recruiting' },
  'orca-nodes-control.humanApproval': { label: 'Aprobación humana', color: '#F59E0B', description: 'Detener el flujo hasta recibir una decisión humana explícita.', category: 'Control Flow' },
};
const customNodeTypes = Object.fromEntries(nodeParity.nodes.map((node) => [node.n8n_equivalent.type === 'n8n-nodes-base.whatsApp' ? `orca.${node.node_id}` : `orca.${node.node_id}`, {
  label: node.node_id.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' '),
  color: node.orca.status === 'listo' ? '#22C55E' : node.orca.status === 'prototipo' ? '#F59E0B' : '#64748B',
  description: node.orca.purpose,
  category: `CareerAI · ${node.orca.block}`,
  n8nType: node.n8n_equivalent.type,
  typeVersion: node.n8n_equivalent.type_version,
  properties: node.configuration.properties,
  useCases: node.use_cases,
}]));
Object.assign(customNodeTypes, featuredNodeTypes);
if (n8nCatalog?.nodes) {
  for (const node of n8nCatalog.nodes) {
    customNodeTypes[node.type] = {
      label: node.label,
      color: node.kind === 'trigger' ? '#FF6D5A' : '#7C4DFF',
      description: node.description,
      category: node.category,
      kind: node.kind,
      iconUrl: node.iconUrl,
      n8nType: node.type,
      typeVersion: node.defaultVersion,
      properties: node.properties,
      credentials: node.credentials,
      inputs: node.inputs,
      outputs: node.outputs,
      webhooks: node.webhooks,
      usableAsTool: node.usableAsTool,
      aliases: node.aliases,
      documentation: node.documentation,
    };
  }
}
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
function buildCareerWorkflow() {
  const layout = layoutGraph(careerLayoutNodes, careerBlueprint?.edges || []);
  const nodes = careerLayoutNodes.map((node) => {
    const { x, y } = layout.positions.get(node.id) || { x: 60, y: 60 };
    const configurationSchema = node.n8n_parity?.configuration || null;
    const parameters = Object.fromEntries((configurationSchema?.properties || []).map((property) => [property.name, property.default]));
    return { id: node.id, name: node.label, type: 'orcaNode',
      position: { x, y }, positionArray: [x, y], x, y,
      parameters, data: { ...node, label: node.label, parameters, configuration_schema: configurationSchema, n8n_equivalent: node.n8n_parity?.n8n_equivalent || null } };
  });
  const connections = {};
  for (const edge of careerBlueprint?.edges || []) {
    (connections[edge.from] ||= []).push({ node_id: edge.to, node: edge.to, type: 'main', index: 0 });
  }
  const edges = (careerBlueprint?.edges || []).map((edge) => ({
    id: `${edge.from}->${edge.to}`, source: edge.from, target: edge.to, type: 'smoothstep', animated: true,
  }));
  const base = { id: careerBlueprint.id, name: careerBlueprint.name, active: false, nodes, connections, edges, links: edges,
    settings: careerBlueprint.settings,
    orca_meta: { source: 'careerai-blueprint', layout: { strategy: layout.strategy || 'topological_grid', lanes: layout.lanes || [], layers: layout.layer_count, columns: layout.columns, rows: layout.rows, back_edges: layout.back_edges.length } } };
  const savedPath = path.join(workflowStateDir, `${careerBlueprint.id}.json`);
  if (!fs.existsSync(savedPath)) return base;
  try { return mergeWorkflowState(base, JSON.parse(fs.readFileSync(savedPath, 'utf8'))); } catch { return base; }
}
function saveWorkflowState(id, payload) {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('invalid_workflow_id');
  const connections = payload.connections || {};
  const edges = Object.entries(connections).flatMap(([source, targets]) => (Array.isArray(targets) ? targets : []).map((target, index) => ({ id: `${source}->${target.node_id || target.node || target}-${index}`, source, target: target.node_id || target.node || target, type: 'smoothstep', animated: true })));
  const safe = { id, name: payload.name || id, active: Boolean(payload.active), nodes: Array.isArray(payload.nodes) ? payload.nodes : [], connections, edges, links: edges, settings: payload.settings || {}, updatedAt: new Date().toISOString() };
  fs.mkdirSync(workflowStateDir, { recursive: true });
  const target = path.join(workflowStateDir, `${id}.json`), temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(safe, null, 2) + '\n'); fs.renameSync(temporary, target); return safe;
}
function serveEditorIndex(res) {
  const file = path.join(dist, 'index.html');
  const serialized = JSON.stringify(buildCareerWorkflow()).replaceAll('<', '\\u003c');
  const html = fs.readFileSync(file, 'utf8').replace('</head>', `<script>window.__ORCA_BOOTSTRAP_WORKFLOW__=${serialized}</script></head>`);
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(html);
}
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
  // Una excepcion en cualquier ruta tumbaba el proceso entero: bastaba una peticion mal
  // formada para dejar ORCA fuera de linea. Ahora el fallo se acota a esa peticion.
  try {
    return handleRequest(req, res);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', path: (req.url || '').split('?')[0], error: String(error.message || error) }));
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: false, error: 'internal_error' }));
  }
});

function proxyOauthRequest(req, res) {
  const oauthPort = Number(process.env.ORCA_OAUTH_PORT || 8788);
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: oauthPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${oauthPort}`,
    },
  }, (upstreamResponse) => {
    res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
    upstreamResponse.pipe(res);
  });
  upstream.on('error', (error) => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'oauth_service_unreachable', message: error.message }));
  });
  req.pipe(upstream);
}

function handleRequest(req, res) {
  const apiPath = (req.url || '').split('?')[0];
  if (apiPath === '/api/careerai/provider-credentials' && req.method === 'GET') return json(res, { ok: true, providers: providerCredentialStatus() });
  const providerMatch = apiPath.match(/^\/api\/careerai\/provider-credentials\/([^/]+)(?:\/(test))?$/);
  if (providerMatch && req.method === 'POST') {
    if (providerMatch[2] === 'test') return testProviderCredential(providerMatch[1]).then((result) => json(res, { ok: true, ...result })).catch((error) => { res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ ok: false, error: error.message })); });
    let raw = ''; req.on('data', (chunk) => { raw += chunk; if (raw.length > 16384) req.destroy(); });
    return req.on('end', () => { try { const body = JSON.parse(raw || '{}'); return json(res, { ok: true, ...saveProviderCredential(providerMatch[1], body.token) }); } catch (error) { res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ ok: false, error: error.message })); } });
  }
  if (providerMatch && req.method === 'DELETE') { try { return json(res, { ok: true, ...removeProviderCredential(providerMatch[1]) }); } catch (error) { res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ ok: false, error: error.message })); } }
  if (apiPath === '/oauth/callback' || apiPath === '/health' || apiPath === '/webhooks/whatsapp') {
    return proxyOauthRequest(req, res);
  }
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
  if (apiPath === '/api/stats') {
    return json(res, {
      ok: true,
      status: 'online',
      service: 'orca-local',
      workflows: 1,
      nodes: (careerBlueprint?.nodes || []).length,
      edges: (careerBlueprint?.edges || []).length,
      runs: listRuns().length,
      hermes: hermesDoctor().status,
      connectors: connectorGates(),
      models: delegationSnapshot(),
      uptime_seconds: Math.floor(process.uptime()),
      updated_at: new Date().toISOString(),
    });
  }
  if (apiPath === '/api/pipeline/stats') {
    const runs = listRuns();
    return json(res, {
      ok: true,
      status: runs.length ? 'running' : 'ready',
      active: runs.filter((run) => run.status === 'running').length,
      completed: runs.filter((run) => run.status === 'completed').length,
      failed: runs.filter((run) => run.status === 'failed').length,
      total: runs.length,
      last_run: runs[0] ? { run_id: runs[0].run_id, status: runs[0].status, started_at: runs[0].started_at } : null,
      updated_at: new Date().toISOString(),
    });
  }
  if (apiPath === '/api/hermes/doctor') return json(res, hermesDoctor());
  if (apiPath === '/api/careerai/models') return json(res, delegationSnapshot());
  if (apiPath === '/api/hermes/memory' || apiPath === '/api/hermes/audit' || apiPath === '/api/orca/evidence') return json(res, { ok: true, data: [] });
  if (apiPath === '/api/prompts/index') return json(res, { ok: true, items: [] });
  if (apiPath === '/api/n8n/node-types') return json(res, customNodeTypes);
  if (apiPath === '/api/n8n/workflows') {
    // React Flow espera position como objeto {x, y}; el array estilo n8n dejaba los nodos
    // apilados en el origen. La rejilla que lo sustituyo ordenaba por declaracion, asi que
    // las conexiones cruzaban el canvas en todas direcciones. Ahora se disponen por capas
    // topologicas y el grafo se lee de izquierda a derecha siguiendo el flujo real.
    // El convertidor del editor lee `node_id` de cada conexion (cae a la cadena suelta si
    // no existe). Enviando solo `node` al estilo n8n, el destino quedaba en [object Object]
    // y no se dibujaba ninguna linea.
    // React Flow dibuja a partir de `edges`; con solo `connections` (formato n8n) el canvas
    // mostraba los nodos sueltos, sin ninguna linea entre ellos.
    return json(res, { ok: true, data: [buildCareerWorkflow()] });
  }
  const workflowMatch = apiPath.match(/^\/api\/n8n\/workflows\/([A-Za-z0-9_-]+)$/);
  if (workflowMatch && req.method === 'GET') return json(res, buildCareerWorkflow());
  if (workflowMatch && req.method === 'PUT') {
    let raw=''; req.on('data',(chunk)=>{raw+=chunk;if(raw.length>5_000_000)req.destroy()});
    return req.on('end',()=>{try{return json(res,{ok:true,...saveWorkflowState(workflowMatch[1],JSON.parse(raw||'{}'))})}catch(error){res.writeHead(400,{'content-type':'application/json'});return res.end(JSON.stringify({ok:false,error:error.message}))}});
  }
  if (apiPath.startsWith('/api/n8n/workflows/') && apiPath.endsWith('/run') && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    return req.on('end', () => {
      let payload = {};
      try { payload = body ? JSON.parse(body) : {}; } catch { payload = {}; }
      try {
        const run = startRun({
          fixture_id: payload.fixture_id || 'indeed-remote-valid',
          opportunity_id: payload.opportunity_id || null,
          provider: payload.provider || 'indeed',
          execute_delegations: true,
          execute_workflow: true,
        });
        return json(res, { ...run, execution_id: run.run_id });
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: error.code || 'run_start_failed' }));
      }
    });
  }
  if (apiPath === '/api/careerai/runs' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    return req.on('end', () => {
      let payload = {};
      try { payload = body ? JSON.parse(body) : {}; } catch { payload = {}; }
      try {
        return json(res, startRun({ ...payload, execute_delegations: true, execute_workflow: true }));
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: error.code || 'run_start_failed' }));
      }
    });
  }
  if (apiPath === '/api/careerai/runs') return json(res, { ok: true, runs: listRuns() });
  if (apiPath.startsWith('/api/careerai/runs/')) {
    const [runId, section] = apiPath.replace('/api/careerai/runs/', '').split('/');
    // executions/pin viven en su propio espacio de datos (data/careerai/executions/<run_id>.json),
    // independiente de si run_id corresponde a un run "vivo" registrado por runs.mjs — el
    // pipeline puede correr con cualquier run_id que le pase el llamador (p. ej. el canvas de
    // ORCA generando uno para una corrida de depuracion puntual), asi que estas rutas no
    // exigen que exista un run rastreado en runs.jsonl.
    if (section === 'executions') {
      const nodeId = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams.get('node_id');
      if (req.method === 'DELETE') return json(res, clearExecutionData(runId));
      return json(res, nodeId ? getNodeExecutionData(runId, nodeId) : getExecutionData(runId));
    }
    if (section === 'pin') {
      const params = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams;
      if (req.method === 'DELETE') {
        const nodeId = params.get('node_id');
        if (nodeId) return json(res, unpinNodeData(runId, nodeId));
        return json(res, clearPinnedData(runId));
      }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        return req.on('end', () => {
          let payload = {};
          try { payload = body ? JSON.parse(body) : {}; } catch { payload = {}; }
          if (!payload.node_id) {
            res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ ok: false, error: 'falta node_id' }));
          }
          return json(res, pinNodeData(runId, payload.node_id, payload.data ?? null));
        });
      }
    }
    const run = getRun(runId);
    if (!run) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'unknown_run', run_id: runId }));
    }
    if (section === 'stop' && req.method === 'POST') return json(res, stopRun(runId));
    if (section === 'resume' && req.method === 'POST') return json(res, resumeRun(runId));
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
  if (apiPath === '/api/careerai/browser-sessions') {
    const params = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams;
    if (req.method === 'GET') return json(res, getReusableBrowserSession({ tenant_id: params.get('tenant_id') || 'default', portal: params.get('portal') || 'indeed' }));
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; if (raw.length > 16384) req.destroy(); });
    return req.on('end', () => {
      try {
        const payload = JSON.parse(raw || '{}');
        if (req.method === 'DELETE') return json(res, revokeBrowserSession(payload));
        if (req.method === 'POST') return json(res, saveBrowserSession(payload));
        res.writeHead(405); return res.end();
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: error.code || 'invalid_session_request' }));
      }
    });
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
  if (apiPath === '/api/careerai/pipeline' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    return req.on('end', async () => {
      let payload = {};
      try { payload = body ? JSON.parse(body) : {}; } catch { payload = {}; }
      try {
        const fixtures = JSON.parse(fs.readFileSync(path.resolve('data/careerai/fixtures.json'), 'utf8'));
        // Sin oportunidades en la peticion se usan las fixtures: el pipeline se puede ver
        // funcionar sin tocar ningun portal.
        const opportunities = payload.opportunities || fixtures.fixtures
          .filter((item) => item.opportunity)
          .map((item) => ({ ...item.opportunity, description: item.opportunity.description || item.opportunity.title || '' }));
        const result = await runPipeline({
          tenantId: payload.tenant_id || 'demo',
          rankedFamilies: payload.ranked_families || ['iseries-core', 'odoo-python'],
          opportunities,
          seenIds: new Set(payload.seen_ids || []),
          candidateCountry: payload.candidate_country || null,
          // Si el llamador manda run_id, esta corrida queda grabada nodo por nodo (input y
          // output reales) para que el canvas de ORCA la pueda depurar como una ejecucion de
          // n8n, via /api/careerai/runs/:id/executions.
          runId: payload.run_id || null,
        });
        return json(res, result);
      } catch (error) {
        res.writeHead(error.code === 'MISSING_TENANT' ? 400 : 500, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: error.code || 'pipeline_failed', message: String(error.message || error) }));
      }
    });
  }
  if (apiPath === '/api/orca/projects') {
    const owner = new URL(req.url || '/', `http://127.0.0.1:${port}`).searchParams.get('owner');
    const links = loadProjectLinks();
    const visible = owner ? links.filter((item) => item.owner?.toLowerCase() === owner.toLowerCase()) : links;
    return json(res, {
      ok: true,
      total: visible.length,
      projects: visible.map((item) => ({
        ...item,
        // La URL util es la que este servidor sirve de verdad, no la que quedo registrada.
        monitoring_url: `http://127.0.0.1:${port}/project/${item.slug}/${item.project_id}`,
        registered_url: item.url,
      })),
    });
  }
  if (apiPath.startsWith('/api/orca/projects/')) {
    const projectId = apiPath.replace('/api/orca/projects/', '').split('/')[0];
    const project = loadProjectLinks().find((item) => item.project_id === projectId);
    if (!project) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'unknown_project', project_id: projectId }));
    }
    // Un proyecto solo ve sus propias corridas.
    const projectRuns = listRuns().filter((run) => !run.project_id || run.project_id === projectId);
    return json(res, {
      ok: true,
      project: { ...project, monitoring_url: `http://127.0.0.1:${port}/project/${project.slug}/${project.project_id}` },
      workflow: careerBlueprint ? { id: careerBlueprint.id, name: careerBlueprint.name, nodes: careerBlueprint.nodes.length, edges: careerBlueprint.edges.length } : null,
      runs: projectRuns.slice(0, 10),
      hermes: hermesDoctor().status,
    });
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
  // /project/<slug>/<id> sirve el mismo editor, con el proyecto preseleccionado.
  const projectMatch = (req.url || '').match(/^\/project\/([^/?]+)\/([^/?]+)/);
  if (projectMatch) {
    const project = loadProjectLinks().find((item) => item.project_id === projectMatch[2]);
    if (!project) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      return res.end('<h1>Proyecto no encontrado</h1><p>Genera uno con <code>npm run orca:project-link -- &lt;usuario&gt; &lt;nombre&gt;</code>.</p>');
    }
    return serveEditorIndex(res);
  }
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = requested === '/' ? '/index.html' : requested;
  const target = path.resolve(dist, `.${relative}`);
  if (!target.startsWith(path.resolve(dist))) { res.writeHead(403); return res.end('Forbidden'); }
  const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(dist, 'index.html');
  if (file === path.join(dist, 'index.html')) return serveEditorIndex(res);
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
  return fs.createReadStream(file).pipe(res);
}

// Un fallo asincrono no capturado tampoco debe tumbar el servidor.
process.on('uncaughtException', (error) => console.error(JSON.stringify({ level: 'fatal_caught', error: String(error.message || error) })));
process.on('unhandledRejection', (error) => console.error(JSON.stringify({ level: 'rejection_caught', error: String(error) })));

// La comprobacion de Hermes tarda ~2,4 s la primera vez. Si la paga la primera peticion, el
// panel de estado del editor se cancela antes de recibir respuesta y se queda en "Loading".
// Se precalienta al arrancar, cuando nadie esta esperando.
hermesDoctor();

ui.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ ok: true, orca_ui: `http://127.0.0.1:${port}/?workflow=careerai-indeed-agent`, oauth: `http://127.0.0.1:${process.env.ORCA_OAUTH_PORT || 8788}/health` })));
function stop() { ui.close(); oauth.kill('SIGTERM'); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
