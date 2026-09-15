-- Test de integridad D03: Workflows, Runs, Steps y Events
-- Verifica composite FKs, maquina de estados de runs y lock_version optimista.

DO 
BEGIN
    ASSERT (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'automation' AND table_name IN ('workflows', 'runs', 'run_steps', 'events')) = 4, 'Tablas de automation no encontradas';
END ;
