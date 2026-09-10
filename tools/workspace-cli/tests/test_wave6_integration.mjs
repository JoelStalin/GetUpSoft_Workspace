import assert from 'node:assert/strict';
import { AuditLogger } from '../../../platform/orca/src/modules/observability/audit-logger.mjs';
import { RateLimiter } from '../../../platform/orca/src/modules/security/rate-limiter.mjs';
import { WorkflowStateMachine, RunState } from '../../../platform/orca/src/modules/automation/state-machine.mjs';

// 1. Test O01: Audit Logger
const audit = new AuditLogger();
audit.log({ level: 'info', event: 'USER_LOGIN', actorId: 'usr-1', organizationId: 'org-a' });
audit.log({ level: 'warn', event: 'TOKEN_EXPIRING', actorId: 'usr-2', organizationId: 'org-b' });
const orgALogs = audit.query({ organizationId: 'org-a' });
assert.equal(orgALogs.length, 1);
assert.equal(orgALogs[0].event, 'USER_LOGIN');

// 2. Test S01: Rate Limiter Window Sliding & Multipliers
const limiter = new RateLimiter({ defaultLimit: 2, windowMs: 5000 });
assert.equal(limiter.isAllowed('ip-1').allowed, true);
assert.equal(limiter.isAllowed('ip-1').allowed, true);
assert.equal(limiter.isAllowed('ip-1').allowed, false);
// Multiplicador VIP (x2)
assert.equal(limiter.isAllowed('ip-vip', { multiplier: 2 }).allowed, true);
assert.equal(limiter.isAllowed('ip-vip', { multiplier: 2 }).allowed, true);
assert.equal(limiter.isAllowed('ip-vip', { multiplier: 2 }).allowed, true);
assert.equal(limiter.isAllowed('ip-vip', { multiplier: 2 }).allowed, true);
assert.equal(limiter.isAllowed('ip-vip', { multiplier: 2 }).allowed, false);

// 3. Test E02: State Machine & Replay
const sm = new WorkflowStateMachine({ runId: 'run-123' });
assert.equal(sm.state, RunState.PENDING);
sm.transitionTo(RunState.RUNNING);
assert.equal(sm.state, RunState.RUNNING);
sm.transitionTo(RunState.FAILED);
assert.equal(sm.state, RunState.FAILED);

// Transicion invalida rechazada (FAILED -> COMPLETED no permitido directamente)
assert.throws(() => {
  sm.transitionTo(RunState.COMPLETED);
}, /Transicion de estado invalida/);

// Replay valido desde FAILED -> PENDING
sm.replay();
assert.equal(sm.state, RunState.PENDING);

console.log(JSON.stringify({
  ok: true,
  wave: 6,
  tasks: ['O01', 'S01', 'E02'],
  observability_audit_verified: true,
  rate_limiter_tiered_verified: true,
  state_machine_replay_verified: true
}));
