-- D02: OIDC, bindings y RLS (Row Level Security)
-- Aplica FORCE ROW LEVEL SECURITY sobre tablas multi-tenant
-- y define politicas para aislamiento total entre organizaciones.

ALTER TABLE iam.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.organizations FORCE ROW LEVEL SECURITY;

ALTER TABLE iam.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.projects FORCE ROW LEVEL SECURITY;

ALTER TABLE iam.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.memberships FORCE ROW LEVEL SECURITY;

ALTER TABLE iam.org_role_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.org_role_bindings FORCE ROW LEVEL SECURITY;

ALTER TABLE iam.project_role_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.project_role_bindings FORCE ROW LEVEL SECURITY;

-- Politica para proyectos: solo visible si el current_setting coincide con organization_id
DROP POLICY IF EXISTS tenant_isolation_projects ON iam.projects;
CREATE POLICY tenant_isolation_projects ON iam.projects
  AS RESTRICTIVE
  USING (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  );

DROP POLICY IF EXISTS tenant_isolation_memberships ON iam.memberships;
CREATE POLICY tenant_isolation_memberships ON iam.memberships
  AS RESTRICTIVE
  USING (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  );

DROP POLICY IF EXISTS tenant_isolation_bindings ON iam.project_role_bindings;
CREATE POLICY tenant_isolation_bindings ON iam.project_role_bindings
  AS RESTRICTIVE
  USING (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  );
