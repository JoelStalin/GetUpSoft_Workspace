# infrastructure/

Destino final (esquema de directorios acordado, sección 2.2) para
`compose`, `hosts`, `networking`, `observability`, `backup`, `mail`. Hoy el
contenido equivalente vive disperso en `infra/` (solo nginx) y en la carpeta
legacy `06_Infrastructure_Networking/`.

**Estado (2026-09-18):** carpeta creada vacía como parte del scaffolding de
bajo riesgo (paso 1 de `governance/migration/inventory/target_directory_schema_gap_analysis.md`).
El contenido real todavía no se movió aquí; el naming tampoco coincide aún
(`infra/` vs `infrastructure/`).

**Antes de mover contenido real a esta carpeta:**
- Verificar `ACTIVE_SESSION.md` / `ACTIVE_TASKS.md` para colisiones con
  trabajo en curso de otros agentes (varias tareas activas tocan
  infraestructura de red/túneles en producción, p. ej. Chefalitas y Gate
  Access).
- Mover con `git mv` (contenido trackeado), nunca copiar y borrar por
  separado.
- Actualizar en el mismo commit cualquier referencia viva (compose files,
  workflows, scripts de deploy).
- Confirmar CI/tests en verde antes y después del movimiento.

Ver `governance/migration/inventory/target_directory_schema_gap_analysis.md`
para el gap completo y `docs/estructura_repo.md` para el diseño acordado.
