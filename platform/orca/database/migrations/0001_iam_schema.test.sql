-- D01 verification: pruebas reales contra Postgres real (no supuestas). Cada bloque
-- debe producir exactamente el resultado indicado en el comentario.
\set ON_ERROR_STOP off

-- Setup: dos organizaciones, un rol, un principal por organizacion.
INSERT INTO iam.organizations (id, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'org-a'),
  ('22222222-2222-2222-2222-222222222222', 'org-b');

INSERT INTO iam.roles (id, name, scope) VALUES
  ('33333333-3333-3333-3333-333333333333', 'operator', 'project');

INSERT INTO iam.principals (id, kind, oidc_issuer, oidc_subject) VALUES
  ('44444444-4444-4444-4444-444444444444', 'human', 'https://idp.example', 'user-a');

INSERT INTO iam.memberships (organization_id, id, principal_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444');

INSERT INTO iam.projects (organization_id, id, slug, product_ref) VALUES
  ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'proyecto-a', 'orca');

-- TEST 1: binding valido, mismo org en project_id y membership_id -> debe insertar OK.
\echo '--- TEST 1: binding valido (se espera INSERT 0 1) ---'
INSERT INTO iam.project_role_bindings (organization_id, project_id, membership_id, role_id)
VALUES ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333');

-- TEST 2: intentar un binding que declara organization_id = org-b pero usa un
-- project_id/membership_id que en realidad pertenecen a org-a -> DEBE FALLAR por FK
-- compuesta (violates foreign key constraint). Esto es lo que impide "cruzar" organizaciones.
\echo '--- TEST 2: binding cruzando organizacion (se espera ERROR de FK) ---'
INSERT INTO iam.project_role_bindings (organization_id, project_id, membership_id, role_id)
VALUES ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333');

-- TEST 3: slug de proyecto duplicado en la MISMA organizacion -> DEBE FALLAR (unicidad).
\echo '--- TEST 3: slug duplicado en la misma org (se espera ERROR de unicidad) ---'
INSERT INTO iam.projects (organization_id, id, slug, product_ref)
VALUES ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'proyecto-a', 'orca');

-- TEST 4: mismo slug de proyecto mas en ORGANIZACION DISTINTA -> DEBE FUNCIONAR (la
-- unicidad es por organizacion, no global).
\echo '--- TEST 4: mismo slug en otra org (se espera INSERT 0 1) ---'
INSERT INTO iam.projects (organization_id, id, slug, product_ref)
VALUES ('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'proyecto-a', 'orca');

-- TEST 5: status invalido en organizations -> DEBE FALLAR (CHECK constraint).
\echo '--- TEST 5: status invalido (se espera ERROR de CHECK) ---'
INSERT INTO iam.organizations (slug, status) VALUES ('org-c', 'esto-no-es-un-estado-valido');

-- TEST 6: device_agent sin oidc_issuer/subject -> DEBE FUNCIONAR (excepcion del CHECK).
\echo '--- TEST 6: device_agent sin OIDC (se espera INSERT 0 1) ---'
INSERT INTO iam.principals (kind) VALUES ('device_agent');

-- TEST 7: human sin oidc_issuer/subject -> DEBE FALLAR (CHECK exige OIDC para humanos).
\echo '--- TEST 7: human sin OIDC (se espera ERROR de CHECK) ---'
INSERT INTO iam.principals (kind) VALUES ('human');

-- TEST 8: roles tecnicos creados sin privilegios elevados -> verificar explicitamente.
\echo '--- TEST 8: ningun rol tecnico es superusuario ni BYPASSRLS (se espera 0 filas) ---'
SELECT rolname FROM pg_roles
WHERE rolname LIKE 'orca_%' AND (rolsuper OR rolbypassrls);
