-- D03: Esquema de ejecuciones, steps y eventos de automatizacion (Seccion 3.3 / 3.4)
-- Aplica optimismo con lock_version, maquina de estados estricta y composite FKs.

CREATE SCHEMA IF NOT EXISTS automation;

CREATE TABLE automation.workflows (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    version int NOT NULL DEFAULT 1,
    status text NOT NULL DEFAULT 'active',
    definition jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    UNIQUE (project_id, slug, version),
    FOREIGN KEY (project_id, organization_id)
        REFERENCES iam.projects (id, organization_id)
        ON DELETE CASCADE,
    CHECK (status IN ('draft', 'active', 'deprecated', 'archived'))
);

CREATE TABLE automation.runs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    trigger_kind text NOT NULL,
    lock_version int NOT NULL DEFAULT 0,
    started_at timestamptz,
    finished_at timestamptz,
    error_details jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    FOREIGN KEY (workflow_id)
        REFERENCES automation.workflows (id)
        ON DELETE CASCADE,
    FOREIGN KEY (project_id, organization_id)
        REFERENCES iam.projects (id, organization_id)
        ON DELETE CASCADE,
    CHECK (status IN ('pending', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled')),
    CHECK (trigger_kind IN ('manual', 'webhook', 'schedule', 'agent_event'))
);

CREATE TABLE automation.run_steps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    step_key text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    inputs jsonb,
    outputs jsonb,
    error_message text,
    started_at timestamptz,
    finished_at timestamptz,

    PRIMARY KEY (id),
    FOREIGN KEY (run_id)
        REFERENCES automation.runs (id)
        ON DELETE CASCADE,
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped'))
);

CREATE TABLE automation.events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    run_id uuid,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    FOREIGN KEY (run_id)
        REFERENCES automation.runs (id)
        ON DELETE SET NULL
);

ALTER TABLE automation.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.events ENABLE ROW LEVEL SECURITY;
