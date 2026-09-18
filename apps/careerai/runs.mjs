import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { connectorGates } from './prepare-only.mjs';
import { getCareerKnowledgeContext } from './knowledge-context.mjs';
import { delegationSnapshot } from './llm-council.mjs';

const runsPath = new URL('../../../../data/careerai/runs.jsonl', import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const delegationDir = path.join(root, 'data', 'careerai', 'delegations');
const controlDir = path.join(root, 'data', 'careerai', 'run-control');

const FORM_PROVIDERS = Object.freeze(['indeed', 'linkedin', 'glassdoor', 'workday', 'greenhouse', 'lever']);
const PAUSE_ON = Object.freeze(['login', 'consent', 'captcha', 'mfa', 'file_upload', 'submit', 'unknown_domain']);

const STEPS = Object.freeze([
  { node_id: 'career-command', status: 'completed' },
  { node_id: 'getupsoft-edx-knowledge', status: 'completed' },
  { node_id: 'indeed-discovery', status: 'completed' },
  { node_id: 'normalize-opportunity', status: 'completed' },
  { node_id: 'nvidia-heavy-analysis', status: 'queued' },
  { node_id: 'hermes-analysis', status: 'queued' },
  { node_id: 'gemini-analysis', status: 'queued' },
  { node_id: 'chatgpt-verification', status: 'queued' },
  { node_id: 'claude-code-review', status: 'queued' },
  { node_id: 'llm-council', status: 'waiting_for_providers' },
  { node_id: 'consensus-score', status: 'waiting_for_providers' },
  { node_id: 'application-draft', status: 'completed' },
  { node_id: 'external-form-fill', status: 'running' },
  { node_id: 'live-browser-monitor', status: 'streaming' },
  { node_id: 'human-approval', status: 'blocked_approval_required' },
  { node_id: 'gmail-notification', status: 'pending' },
  { node_id: 'whatsapp-approval-notification', status: 'draft_only' },
  { node_id: 'linkedin-gate', status: 'blocked_needs_permission' },
  { node_id: 'indeed-apply', status: 'blocked_approval_required' },
  { node_id: 'evidence-log', status: 'pending' },
]);

function delegationFile(runId) { return path.join(delegationDir, `${runId}.json`); }
function readDelegation(runId) {
  try { return JSON.parse(fs.readFileSync(delegationFile(runId), 'utf8')); } catch { return null; }
}
function queueDelegations(runId) {
  fs.mkdirSync(delegationDir, { recursive: true });
  fs.writeFileSync(delegationFile(runId), JSON.stringify({ ok: true, run_id: runId, status: 'queued', providers: ['nvidia', 'hermes', 'gemini', 'claude'], token_policy: 'one_short_probe_each' }, null, 2));
  const worker = spawn(process.execPath, [path.join(root, 'scripts', 'careerai_delegation_worker.mjs'), runId], {
    cwd: root, env: process.env, detached: true, stdio: 'ignore', windowsHide: true,
  });
  worker.unref();
}

export function liveBrowserSession(runId, provider = 'indeed') {
  if (!FORM_PROVIDERS.includes(provider)) {
    const error = new Error(`Unsupported job provider: ${provider}`);
    error.code = 'UNSUPPORTED_PROVIDER';
    throw error;
  }
  return {
    ok: true,
    session_id: `lb-${runId}`,
    run_id: runId,
    provider,
    render_mode: 'live_session',
    stream_url: `/api/careerai/runs/${runId}/stream`,
    screenshot_url: `/api/careerai/runs/${runId}/screenshot`,
    controls: ['pause', 'resume', 'takeover', 'screenshot'],
    read_only_until_approval: true,
    interaction_mode: 'observe_and_takeover',
    fill_mode: 'prepare_only',
    submit_performed: false,
    pause_on: PAUSE_ON,
    user_session_required: true,
    session_status: 'checking',
    actions: [{ sequence: 1, type: 'session_lookup', status: 'pending', visible: true }],
  };
}

function controlFile(runId) { return path.join(controlDir, `${runId}.json`); }
export function readRunControl(runId) {
  try { return JSON.parse(fs.readFileSync(controlFile(runId), 'utf8')); } catch { return null; }
}
export function writeRunControl(runId, patch = {}) {
  fs.mkdirSync(controlDir, { recursive: true });
  const current = readRunControl(runId) || {};
  const next = { ...current, ...patch, run_id: runId, updated_at: new Date().toISOString() };
  const temporary = `${controlFile(runId)}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, controlFile(runId));
  return next;
}
function queueWorkflow(runId) {
  const worker = spawn(process.execPath, [path.join(root, 'scripts', 'careerai_run_worker.mjs'), runId], {
    cwd: root, env: process.env, detached: true, stdio: 'ignore', windowsHide: true,
  });
  worker.unref();
}

function persist(record) {
  fs.appendFileSync(runsPath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export function startRun({ fixture_id = 'indeed-remote-valid', opportunity_id = null, provider = 'indeed', tenant_id = 'default', execute_delegations = false, execute_workflow = false } = {}) {
  const runId = `run-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const record = {
    ok: true,
    run_id: runId,
    workflow_id: 'careerai-indeed-agent',
    mode: 'prepare-only',
    status: 'running',
    started_at: new Date().toISOString(),
    fixture_id,
    opportunity_id,
    provider,
    tenant_id,
    submit_performed: false,
    approval_required: true,
    connector_gates: connectorGates(),
    knowledge_context: getCareerKnowledgeContext(),
    model_delegation: delegationSnapshot(),
    steps: STEPS.map((step, index) => ({ ...step, sequence: index + 1 })),
    live_browser: liveBrowserSession(runId, provider),
    form_fill: { mode: 'prepare_only', providers: FORM_PROVIDERS, fields_staged: true, submit_performed: false, pause_on: PAUSE_ON },
    delegation_execution: execute_delegations ? { status: 'queued', providers: ['nvidia', 'hermes', 'gemini', 'claude'] } : { status: 'not_requested' },
    autocorrection: { status: 'monitoring', max_provider_attempts: 1, fallback_on: ['timeout', 'rate_limited', 'unavailable', 'invalid_response'] },
    evidence: ['run_registered', 'model_delegation_planned', 'getupsoft_knowledge_loaded', 'edx_context_loaded', 'autocorrection_loop_armed', 'live_browser_session_opened', 'form_fill_staged', 'submit_guard_verified'],
  };
  persist(record);
  const control = writeRunControl(runId, { status: 'running', current_step: 'career-command', completed_steps: 0, total_steps: STEPS.length, can_stop: true, desired_action: 'run', live_browser: record.live_browser });
  if (execute_delegations) queueDelegations(runId);
  if (execute_workflow) queueWorkflow(runId);
  return { ...record, control };
}

export function stopRun(runId, { reason = 'user_requested' } = {}) {
  const run = getRun(runId);
  if (!run) return null;
  if (['completed', 'failed', 'cancelled'].includes(run.status)) return run;
  return { ...run, ...writeRunControl(runId, { status: 'cancelled', desired_action: 'stop', can_stop: false, stopped_reason: reason, stopped_at: new Date().toISOString() }) };
}

export function resumeRun(runId) {
  const run = getRun(runId);
  if (!run) return null;
  if (!['waiting_for_user_setup', 'paused'].includes(run.status)) return run;
  const control = writeRunControl(runId, { status: 'running', desired_action: 'run', can_stop: true, resumed_at: new Date().toISOString() });
  queueWorkflow(runId);
  return { ...run, ...control, control };
}

export function listRuns(limit = 25) {
  if (!fs.existsSync(runsPath)) return [];
  return fs
    .readFileSync(runsPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .map((run) => {
      const delegation = readDelegation(run.run_id);
      const control = readRunControl(run.run_id);
      return { ...run, ...(delegation ? { delegation_execution: delegation } : {}), ...(control || {}), control: control || { can_stop: false } };
    })
    .slice(-limit)
    .reverse();
}

export function getRun(runId) {
  return listRuns(Number.MAX_SAFE_INTEGER).find((run) => run.run_id === runId) || null;
}
