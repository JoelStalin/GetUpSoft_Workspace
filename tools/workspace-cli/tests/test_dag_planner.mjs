import assert from 'node:assert/strict';
import { planExecutionOrder, detectPortConflicts } from '../src/planner/dag.mjs';

const manifests = [
  { slug: 'db', dependencies: [] },
  { slug: 'cache', dependencies: [] },
  { slug: 'identity', dependencies: ['db'] },
  { slug: 'api', dependencies: ['db', 'cache', 'identity'] },
  { slug: 'web', dependencies: ['api'] }
];

const plan = planExecutionOrder(manifests, { targetProfile: 'orca-local' });
assert.equal(plan.ok, true);
assert.equal(plan.totalServices, 5);

const steps = plan.executionPlan.map(p => p.service);
assert.ok(steps.indexOf('db') < steps.indexOf('identity'));
assert.ok(steps.indexOf('identity') < steps.indexOf('api'));
assert.ok(steps.indexOf('api') < steps.indexOf('web'));

const cicloManifests = [
  { slug: 'service-a', dependencies: ['service-b'] },
  { slug: 'service-b', dependencies: ['service-a'] }
];

assert.throws(() => {
  planExecutionOrder(cicloManifests);
}, /Ciclo de dependencias detectado/);

const conflicts = detectPortConflicts([
  { slug: 'orca-api', port: 8788 },
  { slug: 'another-api', port: 8788 },
  { slug: 'web', port: 5173 }
]);

assert.equal(conflicts.hasConflicts, true);
assert.equal(conflicts.conflicts[0].port, 8788);

console.log(JSON.stringify({
  ok: true,
  task: 'B02',
  dag_topological_sort_verified: true,
  cycle_detection_verified: true,
  port_conflicts_detection_verified: true
}));
