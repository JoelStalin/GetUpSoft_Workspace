import { getRun, readRunControl, writeRunControl } from '../apps/careerai/runs.mjs';
import { getReusableBrowserSession, touchBrowserSession } from '../apps/careerai/browser-session-vault.mjs';

const runId = process.argv[2];
const run = getRun(runId);
if (!run) process.exit(2);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const steps = run.steps.map((step) => ({ ...step, status: 'pending' }));
const browserActions = [{ sequence: 1, type: 'session_lookup', status: 'running', visible: true }];

for (let index = 0; index < steps.length; index += 1) {
  const control = readRunControl(runId);
  if (control?.desired_action === 'stop') process.exit(0);
  const step = steps[index];
  step.status = 'running';
  writeRunControl(runId, { status: 'running', current_step: step.node_id, completed_steps: index, steps, can_stop: true });
  await delay(350);

  if (step.node_id === 'live-browser-monitor') {
    const lookup = getReusableBrowserSession({ tenant_id: run.tenant_id, portal: run.provider });
    browserActions[0] = { ...browserActions[0], status: 'completed', result: lookup.status };
    if (!lookup.reusable) {
      browserActions.push({ sequence: 2, type: 'user_setup_required', status: 'waiting', visible: true, reason: lookup.status });
      step.status = 'waiting_for_user_setup';
      writeRunControl(runId, {
        status: 'waiting_for_user_setup', current_step: step.node_id, completed_steps: index,
        steps, can_stop: true,
        live_browser: { ...run.live_browser, session_status: lookup.status, setup_required: true, actions: browserActions },
      });
      process.exit(0);
    }
    touchBrowserSession({ tenant_id: run.tenant_id, portal: run.provider });
    browserActions.push(
      { sequence: 2, type: 'navigate', status: 'completed', visible: true, target: `${run.provider}:job-page` },
      { sequence: 3, type: 'inspect_form', status: 'completed', visible: true },
      { sequence: 4, type: 'fill_prepare_only', status: 'completed', visible: true, submit_performed: false },
    );
    writeRunControl(runId, { live_browser: { ...run.live_browser, session_status: 'alive', reused: true, actions: browserActions } });
  }
  step.status = 'completed';
}

writeRunControl(runId, { status: 'waiting_for_approval', current_step: 'human-approval', completed_steps: steps.length, steps, can_stop: true });
