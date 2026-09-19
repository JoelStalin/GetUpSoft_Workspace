# workers/

Destino final (esquema de directorios acordado, sección 2.2) para los workers
especializados: `printing`, `documents`, `data`, `browser`, `ai`. Hoy su
contenido real vive disperso en `apps/` (ej. `apps/local_printer_agent/`) y
en la carpeta legacy `04_Workers/`.

**Estado (2026-09-18):** carpeta creada vacía como parte del scaffolding de
bajo riesgo (paso 1 de `governance/migration/inventory/target_directory_schema_gap_analysis.md`).
El contenido real todavía no se movió aquí.

**Aviso especial:** `apps/local_printer_agent/Chefalitas/` es candidato obvio
para `workers/printing/`, pero coincide con trabajo de recuperación de
producción de Chefalitas en curso (`codex-chefalitas-recovery-20260916` en
`ACTIVE_SESSION.md`). No mover sin coordinar primero con ese agente/tarea.

**Antes de mover contenido real a esta carpeta:**
- Verificar `ACTIVE_SESSION.md` / `ACTIVE_TASKS.md` para colisiones con
  trabajo en curso de otros agentes.
- Mover con `git mv` (contenido trackeado) o `mv` simple (directorios
  gitignored), nunca copiar y borrar por separado.
- Actualizar en el mismo commit cualquier referencia viva (scripts, workflows,
  registry).
- Confirmar CI/tests en verde antes y después del movimiento.

Ver `governance/migration/inventory/target_directory_schema_gap_analysis.md`
para el gap completo y `docs/estructura_repo.md` para el diseño acordado.
