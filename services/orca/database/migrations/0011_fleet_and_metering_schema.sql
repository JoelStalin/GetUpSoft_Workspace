-- D05 / F01 / M02: Esquema de Dispositivos (Fleet) y Presupuestos / Medicion (Metering)
-- Seccion 3.4 del diseno GetUpSoft+ORCA
-- Reglas: Credenciales con hash seguro, pairing transaccional, presupuestos en microdolares (bigint),
-- nunca punto flotante.

CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS metering;

CREATE TABLE fleet.devices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    device_name text NOT NULL,
    os text NOT NULL,
    architecture text NOT NULL,
    status text NOT NULL DEFAULT 'enrolled',
    last_seen_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    FOREIGN KEY (organization_id)
        REFERENCES iam.organizations (id)
        ON DELETE CASCADE,
    CHECK (status IN ('enrolled', 'active', 'suspended', 'revoked'))
);

CREATE TABLE fleet.pairing_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    code_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    UNIQUE (code_hash),
    FOREIGN KEY (organization_id)
        REFERENCES iam.organizations (id)
        ON DELETE CASCADE
);

CREATE TABLE fleet.device_credentials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    device_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    UNIQUE (token_hash),
    FOREIGN KEY (device_id)
        REFERENCES fleet.devices (id)
        ON DELETE CASCADE
);

CREATE TABLE fleet.device_commands (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    device_id uuid NOT NULL,
    run_step_id uuid,
    capability text NOT NULL,
    payload jsonb NOT NULL,
    idempotency_key text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    executed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    UNIQUE (device_id, idempotency_key),
    FOREIGN KEY (device_id)
        REFERENCES fleet.devices (id)
        ON DELETE CASCADE,
    CHECK (status IN ('queued', 'sent', 'acknowledged', 'completed', 'failed', 'expired'))
);

CREATE TABLE metering.budget_periods (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    limit_microusd bigint NOT NULL DEFAULT 0,
    reserved_microusd bigint NOT NULL DEFAULT 0,
    spent_microusd bigint NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    FOREIGN KEY (organization_id)
        REFERENCES iam.organizations (id)
        ON DELETE CASCADE,
    CHECK (limit_microusd >= 0),
    CHECK (reserved_microusd >= 0),
    CHECK (spent_microusd >= 0)
);

CREATE TABLE metering.model_calls (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    run_step_id uuid,
    provider text NOT NULL,
    model_name text NOT NULL,
    input_tokens bigint NOT NULL DEFAULT 0,
    output_tokens bigint NOT NULL DEFAULT 0,
    cost_microusd bigint NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'completed',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    FOREIGN KEY (project_id, organization_id)
        REFERENCES iam.projects (id, organization_id)
        ON DELETE CASCADE,
    CHECK (cost_microusd >= 0)
);

ALTER TABLE fleet.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE metering.budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE metering.model_calls ENABLE ROW LEVEL SECURITY;
