import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WorkflowExecution } from '../../../platform/orca/src/domain/workflow/execution.mjs';

// 1. Verificacion funcional de la entidad
const exec = new WorkflowExecution({
  id: 'exec-1',
  projectId: 'proj-1',
  organizationId: 'org-1',
  definition: { steps: [] }
});
assert.equal(exec.status, 'CREATED');
exec.start();
assert.equal(exec.status, 'IN_PROGRESS');
exec.complete();
assert.equal(exec.status, 'COMPLETED');

// 2. Verificacion estricta de Pureza Hexagonal (A03)
const fileContent = fs.readFileSync('platform/orca/src/domain/workflow/execution.mjs', 'utf8');
const forbidden = [/@nestjs/i, /@prisma/i, /dockerode/i, /openai/i, /axios/i];
for (const p of forbidden) {
  assert.equal(p.test(fileContent), false, 'La capa de dominio no debe importar dependencias de infraestructura');
}

console.log(JSON.stringify({
  ok: true,
  wave: 7,
  tasks: ['A03'],
  domain_entity_lifecycle_verified: true,
  hexagonal_purity_verified: true
}));
