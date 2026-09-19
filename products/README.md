# products/

Destino final (esquema de directorios acordado, sección 2.2) para los productos
propios de GetUpSoft que hoy están dispersos en `apps/`, `02_Products/` y
`06_E_Commerce_Lux/`: `getupsoft-site`, `easycount`, `chefalitas`, `getupnet`,
`smartdoor`, `boat`.

**Estado (2026-09-18):** carpeta creada vacía como parte del scaffolding de
bajo riesgo (paso 1 de `governance/migration/inventory/target_directory_schema_gap_analysis.md`).
El contenido real de cada producto **todavía no se movió aquí**.

**Antes de mover contenido real a esta carpeta:**
- Verificar en `C:\Users\yoeli\.agents_shared_memory\ACTIVE_SESSION.md` que
  ningún otro agente esté trabajando activamente sobre ese producto (p. ej.
  `chefalitas` tuvo recuperación de producción en curso el 2026-09-16/18 —
  coordinar antes de mover).
- Mover con `git mv` (contenido trackeado) o `mv` simple (checkouts
  independientes gitignored), nunca copiar y borrar por separado.
- Actualizar en el mismo commit cualquier referencia viva: `.gitignore`,
  `docker-compose*.yml`, `.github/workflows/*.yml`,
  `governance/registry/projects/*.json`.
- Confirmar CI en verde antes y después del movimiento.

Ver `governance/migration/inventory/target_directory_schema_gap_analysis.md`
para el gap completo y `docs/estructura_repo.md` para el diseño acordado.
