import fs from 'node:fs';
import crypto from 'node:crypto';
import { connectorGates } from './prepare-only.mjs';

const runsPath = new URL('../../../../data/careerai/runs.jsonl', import.meta.url);

const FORM_PROVIDERS = Object.freeze(['indeed', 'linkedin', 'glassdoor', 'workday', 'greenhouse', 'lever']);
const PAUSE_ON = Object.freeze(['login', 'consent', 'captcha', 'mfa', 'file_upload', 'submit', 'unknown_domain']);

const STEPS = Object.freeze([
  { node_id: 'career-command', status: 'completed' },
  { node_id: 'indeed-discovery', status: 'completed' },
  { node_id: 'normalize-opportunity', status: 'completed' },
  { node_id: 'hermes-analysis', status: 'completed' },
  { node_id: 'gemini-analysis', status: 'completed' },
  { node_id: 'chatgpt-verification', status: 'completed' },
  { node_id: 'consensus-score', status: 'completed' },
  { node_id: 'application-draft', status: 'completed' },
  { node_id: 'external-form-fill', status: 'running' },
  { node_id: 'live-browser-monitor', status: 'streaming' },
  { node_id: 'human-approval', status: 'blocked_approval_required' },
  { node_id: 'gmail-notification', status: 'pending' },
  { node_id: 'linkedin-gate', status: 'blocked_needs_permission' },
  { node_id: 'indeed-apply', status: 'blocked_approval_required' },
  { node_id: 'evidence-log', status: 'pending' },
]);

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
  };
}

function persist(record) {
  fs.appendFileSync(runsPath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export function startRun({ fixture_id = 'indeed-remote-valid', opportunity_id = null, provider = 'indeed' } = {}) {
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
    submit_performed: false,
    approval_required: true,
    connector_gates: connectorGates(),
    steps: STEPS.map((step, index) => ({ ...step, sequence: index + 1 })),
    live_browser: liveBrowserSession(runId, provider),
    form_fill: { mode: 'prepare_only', providers: FORM_PROVIDERS, fields_staged: true, submit_performed: false, pause_on: PAUSE_ON },
    evidence: ['run_registered', 'live_browser_session_opened', 'form_fill_staged', 'submit_guard_verified'],
  };
  return persist(record);
}

export function listRuns(limit = 25) {
  if (!fs.existsSync(runsPath)) return [];
  return fs
    .readFileSync(runsPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .slice(-limit)
    .reverse();
}

export function getRun(runId) {
  return listRuns(Number.MAX_SAFE_INTEGER).find((run) => run.run_id === runId) || null;
}
