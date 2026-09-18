-- D02 (mitad de base de datos, sin dependencia de Keycloak/OIDC -- ver nota abajo):
-- politicas RLS reales sobre iam.* y automation.*. El aislamiento entre organizaciones
-- se decide aqui, en la base, no confiando en que la capa de aplicacion "se acuerde" de
-- filtrar por organization_id en cada query.
--
-- NOTA DE ALCANCE: D02 en el diseno original combina "OIDC, bindings y RLS". Esta
-- migracion implementa SOLO la parte de RLS (verificable sin ningun IdP externo). La
-- parte de "OIDC bindings" (pantalla de login real, Keycloak u otro proveedor) requiere
-- una decision del usuario sobre que IdP usar -- no se asume ni se instala aqui.
--
-- Mecanismo: cada transaccion de la aplicacion ejecuta
--   SET LOCAL app.current_organization_id = '<uuid>';
-- ANTES de cualquier query. SET LOCAL es automaticamente local a la transaccion (se
-- resetea al hacer COMMIT/ROLLBACK) -- exactamente la regla del diseno: "el contexto
-- sera local a la transaccion y no persistira accidentalmente en conexiones reutilizadas".

CREATE OR REPLACE FUNCTION iam.current_organization_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_organization_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- FORCE ROW LEVEL SECURITY (no solo ENABLE): sin esto, el DUEÑO de la tabla (quien
-- corrio las migraciones, ej. orca_migrator) seguiria viendo todas las filas sin
-- restriccion -- el diseno lo advierte explicitamente (seccion 3.6).
ALTER TABLE iam.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.organizations
  USING (id = iam.current_organization_id());

ALTER TABLE iam.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.memberships FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.memberships
  USING (organization_id = iam.current_organization_id());

ALTER TABLE iam.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.projects FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.projects
  USING (organization_id = iam.current_organization_id());

ALTER TABLE iam.org_role_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.org_role_bindings FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.org_role_bindings
  USING (organization_id = iam.current_organization_id());

ALTER TABLE iam.project_role_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.project_role_bindings FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.project_role_bindings
  USING (organization_id = iam.current_organization_id());

ALTER TABLE iam.environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.environments FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.environments
  USING (organization_id = iam.current_organization_id());

ALTER TABLE iam.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.installations FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON iam.installations
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.workflows FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.workflows
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.workflow_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.workflow_versions
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.runs FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.runs
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.run_steps FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.run_steps
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.step_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.step_attempts FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.step_attempts
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.run_events FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.run_events
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.approvals FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.approvals
  USING (organization_id = iam.current_organization_id());

ALTER TABLE automation.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.artifacts FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.artifacts
  USING (organization_id = iam.current_organization_id());

-- GRANTs minimos para que orca_api pueda operar bajo RLS (D01 los creo sin ningun
-- permiso). orca_api es el unico rol de aplicacion normal; los demas (dispatcher,
-- indexer, backup, audit_reader) se acotan cuando K01/E01 los necesiten de verdad, para
-- no otorgar permisos "por si acaso" a un rol que todavia no ejecuta ningun codigo.
GRANT USAGE ON SCHEMA iam, automation TO orca_api;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA iam TO orca_api;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA automation TO orca_api;
GRANT EXECUTE ON FUNCTION iam.current_organization_id() TO orca_api;
