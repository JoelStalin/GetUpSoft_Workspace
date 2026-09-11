import assert from 'node:assert/strict';
import { provisionOrcaProject } from '../platform/orca/src/careerai/orca-project-provisioner.mjs';

const base = { owner: 'cliente-acme', projectName: 'Migracion Odoo Acme', domain: 'http://127.0.0.1:4173' };

const first = provisionOrcaProject(base);
assert.equal(first.ok, true);
assert.equal(first.url, `http://127.0.0.1:4173/project/${first.slug}/${first.project_id}`);
assert.equal(first.records.length, 1);

// Mismo owner+slug: reemplaza, no duplica.
const second = provisionOrcaProject({ ...base, existingRecords: first.records });
assert.equal(second.records.length, 1, 'idempotente: no duplica el mismo proyecto');
assert.equal(second.project_id, first.project_id, 'el project_id es deterministico para el mismo owner+slug');

// Distinto proyecto para el mismo owner: se acumula, no reemplaza al otro.
const third = provisionOrcaProject({ owner: base.owner, projectName: 'Otro Proyecto', domain: base.domain, existingRecords: second.records });
assert.equal(third.records.length, 2);

const noDomain = provisionOrcaProject({ owner: base.owner, projectName: base.projectName });
assert.equal(noDomain.ok, false, 'sin domain no genera una URL que no apunta a nada');

console.log(JSON.stringify({ ok: true, node: 'orca-project-provisioner', project_id_deterministico: true, idempotente_por_owner_slug: true, url_apunta_al_servidor_real: true }));
