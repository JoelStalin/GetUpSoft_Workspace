# Politica de Migracion Gradual y Conservacion de Originales (R01)

## 1. Principio Fundamental
- NINGUN directorio o archivo original de clientes (Galantes Jewelry, Chefalitas, EasyCount, Odoo) sera eliminado, renombrado o desplazado sin un checkout aislado, verificacion de hash y plan de contingencia.
- El workspace opera de forma federada: los proyectos productivos conservan sus propios repositorios y pipelines de despliegue independientes.

## 2. Protocolo de Reubicacion
1. Auditoria previa contra el Catalogo de Proyectos (governance/registry/projects/).
2. Generacion de manifest de rollback con checksums SHA-256 de cada archivo involucrado.
3. Copia en espejo a la nueva estructura federada (apps/, platform/, services/).
4. Pruebas de regresion automatizadas en el nuevo destino.
5. Verificacion del estado productivo en caliente (sin desconexion de tunnels ni containers).
