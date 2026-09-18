-- K03: prompts versionados inmutables una vez publicados (seccion 3.3 del diseno). A
-- diferencia de workflow_versions (D03, donde se dejo como convencion de permisos de rol
-- porque D02/GRANTs todavia no estaban decididos), aqui SI se fuerza con un trigger real
-- -- D02 ya existe (0003_row_level_security.sql), asi que ya no hay razon para dejarlo
-- solo como convencion.
CREATE OR REPLACE FUNCTION knowledge.prevent_published_prompt_mutation() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'published' THEN
    RAISE EXCEPTION 'prompt_version % ya esta publicada (inmutable): no se puede modificar, cree una version nueva', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompt_version_immutable
  BEFORE UPDATE ON knowledge.prompt_versions
  FOR EACH ROW
  EXECUTE FUNCTION knowledge.prevent_published_prompt_mutation();
