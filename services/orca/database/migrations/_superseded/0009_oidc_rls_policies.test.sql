-- D02 Test: Validar aislamiento RLS entre dos organizaciones
-- Simula la ejecucion en una sesion con cambio de app.current_organization_id

-- 1. Asignar contexto a Org A
SET LOCAL app.current_organization_id = '11111111-1111-1111-1111-111111111111';

-- Debe devolver solo proyectos de Org A (1 fila)
SELECT COUNT(*) FROM iam.projects;

-- 2. Cambiar contexto a Org B
SET LOCAL app.current_organization_id = '22222222-2222-2222-2222-222222222222';

-- Debe devolver solo proyectos de Org B (1 fila)
SELECT COUNT(*) FROM iam.projects;

-- 3. Sin contexto de organizacion: debe devolver 0 filas (aislamiento seguro por defecto)
RESET app.current_organization_id;
SELECT COUNT(*) FROM iam.projects;
