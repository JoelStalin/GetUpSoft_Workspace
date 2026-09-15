-- D01: esquema IAM y catalogo (seccion 3.2 / 3.5 / 3.6 del diseno GetUpSoft+ORCA).
-- Reglas aplicadas: UUID, timestamptz UTC, FK compuestas para impedir mezclar
-- organizaciones, CHECK para estados permitidos, roles de base separados (D02 aplica
-- las politicas RLS sobre estas tablas -- aqui solo el esquema y sus restricciones).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS iam;

CREATE TABLE iam.organizations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    kind text NOT NULL DEFAULT 'customer',
    security_profile text NOT NULL DEFAULT 'standard',
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    UNIQUE (slug),
    CHECK (security_profile IN ('standard', 'strict')),
    CHECK (status IN ('active', 'suspended', 'archived'))
);

CREATE TABLE iam.principals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    kind text NOT NULL,
    oidc_issuer text,
    oidc_subject text,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    CHECK (kind IN ('human', 'service_account', 'device_agent')),
    CHECK (status IN ('active', 'suspended', 'revoked')),
    -- Un principal humano/service_account real tiene issuer+subject; un device_agent no
    -- se autentica via OIDC (usa credencial de dispositivo, ver F01) y puede no tenerlos.
    CHECK (
        kind = 'device_agent'
        OR (oidc_issuer IS NOT NULL AND oidc_subject IS NOT NULL)
    ),
    UNIQUE (oidc_issuer, oidc_subject)
);

CREATE TABLE iam.roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    scope text NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (name),
    CHECK (scope IN ('organization', 'project'))
);

CREATE TABLE iam.permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    key text NOT NULL,
    description text,

    PRIMARY KEY (id),
    UNIQUE (key)
);

CREATE TABLE iam.role_permissions (
    role_id uuid NOT NULL REFERENCES iam.roles (id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES iam.permissions (id) ON DELETE CASCADE,

    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.memberships (
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    principal_id uuid NOT NULL REFERENCES iam.principals (id) ON DELETE CASCADE,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, id),
    UNIQUE (organization_id, principal_id),
    CHECK (status IN ('active', 'suspended'))
);

CREATE TABLE iam.org_role_bindings (
    organization_id uuid NOT NULL,
    membership_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES iam.roles (id),
    environment_stage text,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, id),
    -- FK compuesta: el binding solo puede apuntar a un membership de la MISMA
    -- organizacion. Esto es lo que impide que un role binding "cruce" organizaciones.
    FOREIGN KEY (organization_id, membership_id) REFERENCES iam.memberships (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, membership_id, role_id, environment_stage)
);

CREATE TABLE iam.projects (
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    product_ref text NOT NULL,
    lifecycle_status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, id),
    UNIQUE (organization_id, slug),
    CHECK (lifecycle_status IN ('active', 'paused', 'archived'))
);

CREATE TABLE iam.project_role_bindings (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    membership_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES iam.roles (id),
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    -- Doble FK compuesta: el proyecto y el membership deben pertenecer a la MISMA
    -- organizacion que el binding declara. Un binding no puede otorgar acceso a un
    -- proyecto de otra organizacion aunque alguien intente forzar los IDs.
    FOREIGN KEY (organization_id, project_id) REFERENCES iam.projects (organization_id, id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id, membership_id) REFERENCES iam.memberships (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, membership_id, role_id)
);

CREATE TABLE iam.environments (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    stage text NOT NULL,
    data_policy text NOT NULL DEFAULT 'standard',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id) REFERENCES iam.projects (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, stage),
    CHECK (stage IN ('development', 'staging', 'production')),
    CHECK (data_policy IN ('standard', 'strict-no-external-egress'))
);

CREATE TABLE iam.installations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    hosting_mode text NOT NULL,
    region text,
    release_version text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    CHECK (hosting_mode IN ('shared', 'dedicated', 'self-host'))
);

-- Roles tecnicos de base separados (seccion 3.6). Creados sin privilegios hasta que D02
-- les asigne permisos explicitos via GRANT — ninguno es superusuario ni tiene BYPASSRLS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_migrator') THEN
        CREATE ROLE orca_migrator NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_api') THEN
        CREATE ROLE orca_api NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_dispatcher') THEN
        CREATE ROLE orca_dispatcher NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_indexer') THEN
        CREATE ROLE orca_indexer NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_backup') THEN
        CREATE ROLE orca_backup NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'orca_audit_reader') THEN
        CREATE ROLE orca_audit_reader NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
END
$$;
