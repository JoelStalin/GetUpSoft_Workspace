\set ON_ERROR_STOP off

INSERT INTO iam.organizations (id, slug) VALUES ('11111111-1111-1111-1111-111111111111', 'org-a');
INSERT INTO iam.principals (id, kind, oidc_issuer, oidc_subject) VALUES ('44444444-4444-4444-4444-444444444444', 'human', 'https://idp.example', 'user-a');
INSERT INTO iam.projects (organization_id, id, slug, product_ref) VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'proyecto-a', 'orca');
INSERT INTO automation.workflows (organization_id, project_id, id, slug) VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'wf-1');
INSERT INTO automation.workflow_versions (organization_id, project_id, workflow_id, id, version, content_hash, status) VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 1, 'hash1', 'published');
INSERT INTO automation.runs (organization_id, project_id, id, workflow_version_id, requested_by, idempotency_key, input_hash) VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'idem-1', 'inputhash1');

-- TEST 1: status invalido -> DEBE FALLAR (CHECK).
\echo '--- TEST 1: status invalido en runs (se espera ERROR de CHECK) ---'
UPDATE automation.runs SET status = 'estado-inventado' WHERE id = '99999999-9999-9999-9999-999999999999';

-- TEST 2: idempotency_key duplicada en la MISMA org+project -> DEBE FALLAR.
\echo '--- TEST 2: idempotency_key duplicada (se espera ERROR de unicidad) ---'
INSERT INTO automation.runs (organization_id, project_id, id, workflow_version_id, requested_by, idempotency_key, input_hash)
VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'idem-1', 'otro-input');

-- TEST 3: run de un workflow_version de OTRA organizacion -> DEBE FALLAR (FK compuesta),
-- exactamente el mismo criterio de aislamiento verificado en D01.
\echo '--- TEST 3: run declarando otra organizacion que su workflow_version real (se espera ERROR de FK) ---'
INSERT INTO iam.organizations (id, slug) VALUES ('22222222-2222-2222-2222-222222222222', 'org-b');
INSERT INTO automation.runs (organization_id, project_id, id, workflow_version_id, requested_by, idempotency_key, input_hash)
VALUES ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'idem-2', 'inputX');

-- TEST 4: bloqueo optimista real -- dos transacciones "concurrentes" leen lock_version=0,
-- la primera en confirmar (COMMIT) gana; la segunda, al intentar aplicar su UPDATE
-- condicionado a lock_version=0 (que ya cambio a 1), debe afectar CERO filas.
\echo '--- TEST 4: bloqueo optimista bajo concurrencia real ---'
