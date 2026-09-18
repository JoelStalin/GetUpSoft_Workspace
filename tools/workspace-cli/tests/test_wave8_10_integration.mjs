import assert from 'node:assert/strict';
import fs from 'node:fs';

// 1. Verificacion R01
assert.ok(fs.existsSync('governance/migration/R01-reorganization-policy.md'));
const policyText = fs.readFileSync('governance/migration/R01-reorganization-policy.md', 'utf8');
assert.ok(policyText.includes('Conservacion de Originales'));

// 2. Verificacion P01
assert.ok(fs.existsSync('governance/migration/P01-cutover-manifest.json'));
const manifest = JSON.parse(fs.readFileSync('governance/migration/P01-cutover-manifest.json', 'utf8'));
assert.equal(manifest.policy, 'GRADUAL_NON_DESTRUCTIVE');
assert.equal(manifest.rollback_manifest.can_rollback, true);

console.log(JSON.stringify({
  ok: true,
  wave: 10,
  tasks: ['R01', 'R02', 'P01', 'P02'],
  migration_policy_verified: true,
  cutover_manifest_verified: true,
  rollback_prepared: true
}));
