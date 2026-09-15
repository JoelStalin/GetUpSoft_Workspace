// E02 - Workflow Replay & State Machine Engine
export const RunState = {
  PENDING: 'pending',
  RUNNING: 'running',
  WAITING_APPROVAL: 'waiting_approval',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const ALLOWED_TRANSITIONS = {
  [RunState.PENDING]: [RunState.RUNNING, RunState.CANCELLED],
  [RunState.RUNNING]: [RunState.WAITING_APPROVAL, RunState.COMPLETED, RunState.FAILED, RunState.CANCELLED],
  [RunState.WAITING_APPROVAL]: [RunState.RUNNING, RunState.CANCELLED],
  [RunState.COMPLETED]: [],
  [RunState.FAILED]: [RunState.PENDING],
  [RunState.CANCELLED]: []
};

export class WorkflowStateMachine {
  constructor({ runId, initialState = RunState.PENDING } = {}) {
    this.runId = runId;
    this.state = initialState;
    this.history = [{ state: initialState, timestamp: new Date().toISOString() }];
  }

  transitionTo(nextState, { reason = '' } = {}) {
    const valid = (ALLOWED_TRANSITIONS[this.state] || []).includes(nextState);
    if (!valid) {
      const err = new Error('Transicion de estado invalida: de ' + this.state + ' hacia ' + nextState);
      err.code = 'ERR_INVALID_STATE_TRANSITION';
      throw err;
    }
    this.state = nextState;
    this.history.push({ state: nextState, reason, timestamp: new Date().toISOString() });
    return { ok: true, state: this.state };
  }

  replay() {
    return this.transitionTo(RunState.PENDING, { reason: 'REPLAY_TRIGGERED' });
  }
}
