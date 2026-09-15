-- D03: esquema workflows/runs/eventos (seccion 3.4 / 3.5 del diseno GetUpSoft+ORCA).
-- Requiere 0001_iam_schema.sql (organizations, projects) ya aplicado.

CREATE SCHEMA IF NOT EXISTS automation;

CREATE TABLE automation.workflows (
    organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id) REFERENCES iam.projects (organization_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, slug)
);

CREATE TABLE automation.workflow_versions (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    version integer NOT NULL,
    content_hash text NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, workflow_id) REFERENCES automation.workflows (organization_id, project_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, workflow_id, version),
    CHECK (status IN ('draft', 'published', 'deprecated'))
    -- Inmutable por convencion de aplicacion (regla 3.5): una vez publicada, una version
    -- de workflow no se actualiza -- se crea una version nueva. No se fuerza con un
    -- trigger aqui para no acoplar el schema a una decision que pertenece a D02/la capa
    -- de aplicacion (quien tiene permiso de UPDATE en este schema).
);

CREATE TABLE automation.runs (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    workflow_version_id uuid NOT NULL,
    requested_by uuid NOT NULL REFERENCES iam.principals (id),
    status text NOT NULL DEFAULT 'queued',
    idempotency_key text NOT NULL,
    input_hash text NOT NULL,
    lock_version integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, workflow_version_id) REFERENCES automation.workflow_versions (organization_id, project_id, id),
    UNIQUE (organization_id, project_id, idempotency_key),
    CHECK (status IN (
        'queued', 'running', 'waiting_approval',
        'cancel_requested', 'cancelled',
        'succeeded', 'failed'
    ))
);

CREATE TABLE automation.run_steps (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    run_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    capability text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    deadline_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, run_id) REFERENCES automation.runs (organization_id, project_id, id) ON DELETE CASCADE,
    CHECK (status IN ('pending', 'running', 'succeeded', 'failed', 'skipped'))
);

CREATE TABLE automation.step_attempts (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    step_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    attempt_number integer NOT NULL,
    status text NOT NULL,
    error text,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, step_id) REFERENCES automation.run_steps (organization_id, project_id, id) ON DELETE CASCADE,
    UNIQUE (organization_id, project_id, step_id, attempt_number),
    CHECK (status IN ('running', 'succeeded', 'failed'))
);

-- Append-only por convencion de aplicacion: el rol de aplicacion (orca_api, ver D01) solo
-- recibe INSERT sobre esta tabla -- UPDATE/DELETE quedan reservados a un rol de
-- mantenimiento separado (orca_audit_reader es de SOLO lectura; ninguno de los roles de
-- aplicacion creados en D01 tiene UPDATE/DELETE por defecto).
CREATE TABLE automation.run_events (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    run_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, run_id) REFERENCES automation.runs (organization_id, project_id, id) ON DELETE CASCADE
);

CREATE TABLE automation.approvals (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    run_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    requested_at timestamptz NOT NULL DEFAULT now(),
    decided_by uuid REFERENCES iam.principals (id),
    decision text,
    decided_at timestamptz,

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, run_id) REFERENCES automation.runs (organization_id, project_id, id) ON DELETE CASCADE,
    CHECK (decision IS NULL OR decision IN ('approved', 'rejected'))
);

CREATE TABLE automation.artifacts (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    run_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    kind text NOT NULL,
    content_hash text NOT NULL,
    storage_ref text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    FOREIGN KEY (organization_id, project_id, run_id) REFERENCES automation.runs (organization_id, project_id, id) ON DELETE CASCADE
);
