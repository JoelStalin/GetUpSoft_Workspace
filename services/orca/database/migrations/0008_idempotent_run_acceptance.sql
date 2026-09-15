-- E02: idempotencia y reconciliacion de efectos (seccion 3.5 del diseno: "claves de
-- idempotencia acompañadas por hash del payload: reutilizar una clave con otro
-- contenido devuelve conflicto"). El UNIQUE(idempotency_key) de D03 por si solo rechaza
-- CUALQUIER reintento -- lo que realmente hace falta es distinguir un reintento honesto
-- (mismo payload, la request se perdio en la red y el cliente reintenta) de un intento
-- de reusar la clave con contenido distinto (un bug del cliente, o un ataque).

CREATE OR REPLACE FUNCTION automation.accept_run(
  p_organization_id uuid,
  p_project_id uuid,
  p_workflow_version_id uuid,
  p_requested_by uuid,
  p_idempotency_key text,
  p_input_hash text
) RETURNS TABLE (run_id uuid, outcome text) AS $$
DECLARE
  existing automation.runs;
  new_id uuid;
BEGIN
  SELECT * INTO existing FROM automation.runs
  WHERE organization_id = p_organization_id
    AND project_id = p_project_id
    AND idempotency_key = p_idempotency_key;

  IF existing.id IS NOT NULL THEN
    IF existing.input_hash = p_input_hash THEN
      -- Reintento honesto: mismo payload, misma clave -- devuelve el run YA aceptado,
      -- nunca crea uno nuevo ni ejecuta el efecto por segunda vez.
      RETURN QUERY SELECT existing.id, 'already_accepted'::text;
      RETURN;
    ELSE
      -- Misma clave, contenido DISTINTO -- esto es lo que el diseno exige que devuelva
      -- conflicto en vez de silenciosamente aceptar el nuevo contenido bajo la clave
      -- vieja (eso reescribiria en silencio que se aprobo).
      RAISE EXCEPTION 'idempotency_key % ya se uso con un payload distinto (input_hash esperado %, recibido %)', p_idempotency_key, existing.input_hash, p_input_hash
        USING ERRCODE = '23505';
    END IF;
  END IF;

  INSERT INTO automation.runs (organization_id, project_id, workflow_version_id, requested_by, idempotency_key, input_hash)
  VALUES (p_organization_id, p_project_id, p_workflow_version_id, p_requested_by, p_idempotency_key, p_input_hash)
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, 'created'::text;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION automation.accept_run(uuid, uuid, uuid, uuid, text, text) TO orca_api;
