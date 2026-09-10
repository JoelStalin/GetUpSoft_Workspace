# K01: Verificacion real del esquema de conocimiento y politica de ingestion

**Fecha:** 2026-09-10
**Metodo:** mismo patron de D01/D02/D03 — Postgres 17 desechable, dos roles conectables
reales (`orca_api_login`, `orca_indexer_login`, ninguno con `BYPASSRLS`).

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | `orca_indexer` registra fuente + version | INSERT ok | ✅ |
| 2 | `orca_indexer` intenta `UPDATE` sobre `source_versions` | DENEGADO — append-only REAL por GRANT, no solo documentado | ✅ `permission denied for table source_versions` |
| 3 | `orca_indexer` intenta `DELETE` sobre `source_versions` | DENEGADO | ✅ `permission denied for table source_versions` |
| 4 | `classification` con valor no permitido | ERROR CHECK | ✅ `violates check constraint sources_classification_check` |
| 5 | `orca_api` intenta `INSERT` en `sources` (sin permiso de escritura ahi) | DENEGADO — la escritura de fuentes es responsabilidad del indexador, no de cualquier request HTTP | ✅ `permission denied for table sources` |
| 6 | `orca_api` lee `sources` bajo RLS con contexto correcto | Ve la fuente que `orca_indexer` registro | ✅ devuelve `https://docs.example/careerai` |

**Politica de ingestion** (`platform/client-gateway/apps/api/src/modules/knowledge/domain/ingestion-policy.ts`,
funcion pura `decideIngestion`): 5 tests unitarios — `classification: 'restricted'` nunca
se indexa aunque este verificada; solo `verification_status: 'verified'` es indexable
(`unverified`/`flagged`/`revoked` se rechazan explicitamente, cada uno con su propio
caso de prueba en vez de agruparlos).

## Decisiones de diseno

- Embeddings viven en tabla separada de `chunks`, sin su propio `content_hash` (serian
  redundantes) — son derivados, se pueden borrar/reconstruir sin perder conocimiento
  (regla 3.3 del diseno original).
- `orca_indexer` escribe `sources/source_versions/chunks/embeddings`; `orca_api` solo lee
  esas 4 tablas pero SI puede escribir `prompt_templates/prompt_versions` (los prompts
  los gestiona la aplicacion, no el pipeline de indexado).

## Pendiente (fuera de alcance de K01)

- Pipeline real de ingestion (leer un documento real, calcular `content_hash`, invocar
  `decideIngestion`, insertar) — esta tarea entrego el esquema + la politica de decision,
  no el conector a una fuente real (Git, un CMS, etc.), que es trabajo separado.
- pgvector para busqueda semantica real sobre `embeddings` — es K02, no K01.
