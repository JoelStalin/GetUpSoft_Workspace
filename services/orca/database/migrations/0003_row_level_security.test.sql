-- Corre como postgres (superusuario) SOLO para el seed inicial; las verificaciones reales
-- se hacen conectando como orca_api_login (sin BYPASSRLS) en un script separado.
INSERT INTO iam.organizations (id, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'org-a'),
  ('22222222-2222-2222-2222-222222222222', 'org-b');
INSERT INTO iam.projects (organization_id, id, slug, product_ref) VALUES
  ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'proyecto-a', 'orca'),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'proyecto-b', 'orca');
