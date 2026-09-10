import assert from 'node:assert/strict';
import { ProcessSupervisor } from '../src/process-supervision/index.mjs';

const supervisor = new ProcessSupervisor();

// 1. Registro de proceso (usamos un PID simulado y mockup de kill para pruebas)
supervisor.killProcess = (pid, signal) => true;
supervisor.isPidAlive = (pid) => pid === 99999;

const rec1 = supervisor.registerProcess({
  runId: 'run-001',
  service: 'test-service-1',
  pid: 99999,
  command: 'node test.js'
});

assert.equal(rec1.service, 'test-service-1');
assert.equal(rec1.status, 'RUNNING');

// 2. Proteccion contra arranque duplicado con PID vivo
assert.throws(() => {
  supervisor.registerProcess({
    runId: 'run-002',
    service: 'test-service-1',
    pid: 99999,
    command: 'node test.js'
  });
}, /ya se encuentra en ejecucion/);

// 3. Ver estado de supervisor
const status = supervisor.getStatus();
assert.equal(status.length, 1);
assert.equal(status[0].alive, true);

// 4. Parada de proceso
const stopRes = supervisor.stopProcess('test-service-1');
assert.equal(stopRes.ok, true);
assert.equal(supervisor.getStatus().length, 0);

// 5. Verificacion de rollback ante fallo parcial
supervisor.registerProcess({
  runId: 'run-fail-1',
  service: 'partial-svc-1',
  pid: 99999,
  command: 'node p1.js'
});
const rollbackRes = supervisor.rollbackAll('SIMULATED_FAILURE');
assert.equal(rollbackRes.ok, true);
assert.equal(rollbackRes.rolledBackCount, 1);
assert.equal(supervisor.getStatus().length, 0);

console.log(JSON.stringify({
  ok: true,
  task: 'B03',
  process_supervision_verified: true,
  duplicate_protection_verified: true,
  partial_rollback_verified: true
}));
