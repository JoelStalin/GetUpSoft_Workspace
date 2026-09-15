-- Seed como postgres.
INSERT INTO iam.organizations (id, slug) VALUES ('11111111-1111-1111-1111-111111111111', 'org-a');
INSERT INTO iam.projects (organization_id, id, slug, product_ref) VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'proyecto-a', 'orca');

\echo '--- TEST 1 (como orca_indexer): registra una fuente + version -> OK ---'
INSERT INTO knowledge.sources (organization_id, project_id, id, canonical_uri, classification, verification_status)
VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'https://docs.example/careerai', 'internal', 'verified');
INSERT INTO knowledge.source_versions (organization_id, project_id, source_id, id, content_hash)
VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'hash-v1');

\echo '--- TEST 2 (como orca_indexer): intentar UPDATE sobre source_versions -> DEBE FALLAR (append-only real, no solo convencion) ---'
UPDATE knowledge.source_versions SET content_hash = 'hash-alterado' WHERE id = '88888888-8888-8888-8888-888888888888';

\echo '--- TEST 3 (como orca_indexer): intentar DELETE sobre source_versions -> DEBE FALLAR ---'
DELETE FROM knowledge.source_versions WHERE id = '88888888-8888-8888-8888-888888888888';

\echo '--- TEST 4: classification invalida -> DEBE FALLAR (CHECK) ---'
INSERT INTO knowledge.sources (organization_id, project_id, id, canonical_uri, classification)
VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 'https://otra.example', 'nivel-inventado');
