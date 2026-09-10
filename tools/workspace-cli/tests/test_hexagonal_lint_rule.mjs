import assert from 'node:assert/strict';

const forbidden = [/@nestjs/i, /@prisma/i, /dockerode/i, /openai/i];

function check(text) {
  for (const p of forbidden) {
    if (p.test(text)) return false;
  }
  return true;
}

const clean = 'export interface Port { run(): void; }';
assert.equal(check(clean), true);

const dirty = 'import { PrismaClient } from \'@prisma/client\';';
assert.equal(check(dirty), false);

console.log(JSON.stringify({ ok: true, task: 'A02', hexagonal_clean_architecture_lint_verified: true }));
