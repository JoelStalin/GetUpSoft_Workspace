import assert from 'node:assert/strict';
import { startRun, getRun, stopRun } from '../apps/orca/src/careerai/runs.mjs';

const run = startRun({ provider: 'indeed', tenant_id: 'test-lifecycle', execute_delegations: false, execute_workflow: false });
assert.equal(run.status, 'running');
assert.equal(run.control.can_stop, true);
assert.equal(run.live_browser.actions[0].type, 'session_lookup');

const stopped = stopRun(run.run_id, { reason: 'functional_test' });
assert.equal(stopped.status, 'cancelled');
assert.equal(stopped.stopped_reason, 'functional_test');
assert.ok(stopped.stopped_at);
assert.equal(getRun(run.run_id).status, 'cancelled');
assert.equal(getRun(run.run_id).control.can_stop, false);

console.log(JSON.stringify({ ok: true, node: 'run-lifecycle', run_id: run.run_id, transition: ['running', 'cancelled'] }));
