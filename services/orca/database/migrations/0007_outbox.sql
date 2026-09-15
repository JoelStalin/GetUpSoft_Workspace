-- E01: outbox y cola durable (seccion 3.7 / 5.1 del diseno). Patron transactional
-- outbox: la tarea se acepta y se escribe en la MISMA transaccion que el hecho que la
-- origina (ej. un run) -- si la transaccion commitea, la tarea esta garantizada en disco
-- antes de que cualquier respuesta HTTP salga; un reinicio del dispatcher nunca puede
-- perder una tarea que ya fue aceptada, porque nunca vivio solo en memoria.

CREATE TABLE automation.outbox (
    organization_id uuid NOT NULL,
    project_id uuid NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid,
    task_type text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending',
    -- claimed_by/claimed_at: permite que un dispatcher reclame una tarea sin que otro la
    -- tome tambien (ver funcion claim_next abajo) -- sin esto, dos dispatchers
    -- concurrentes procesarian la misma tarea dos veces.
    claimed_by text,
    claimed_at timestamptz,
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, project_id, id),
    CHECK (status IN ('pending', 'claimed', 'processed', 'failed'))
);

CREATE INDEX outbox_pending_idx ON automation.outbox (created_at) WHERE status = 'pending';

ALTER TABLE automation.outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation.outbox FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON automation.outbox USING (organization_id = iam.current_organization_id());

GRANT SELECT, INSERT, UPDATE ON automation.outbox TO orca_api;
GRANT USAGE ON SCHEMA automation TO orca_dispatcher;
GRANT SELECT, UPDATE ON automation.outbox TO orca_dispatcher;

-- Reclamo atomico: SELECT ... FOR UPDATE SKIP LOCKED es lo que garantiza que dos
-- dispatchers concurrentes nunca reclamen la misma fila -- uno la bloquea, el otro
-- simplemente la salta (SKIP LOCKED) en vez de esperar y luego procesarla igual.
CREATE OR REPLACE FUNCTION automation.claim_next_outbox_task(p_dispatcher_id text)
RETURNS automation.outbox AS $$
DECLARE
  claimed automation.outbox;
BEGIN
  SELECT * INTO claimed FROM automation.outbox
  WHERE status = 'pending'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF claimed.id IS NOT NULL THEN
    UPDATE automation.outbox
    SET status = 'claimed', claimed_by = p_dispatcher_id, claimed_at = now()
    WHERE organization_id = claimed.organization_id AND project_id = claimed.project_id AND id = claimed.id
    RETURNING * INTO claimed;
  END IF;

  RETURN claimed;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION automation.claim_next_outbox_task(text) TO orca_dispatcher;
