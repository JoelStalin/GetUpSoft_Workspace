# K02: Verificacion real de full-text + recuperacion semantica

**Fecha:** 2026-09-10
**Metodo:** Postgres real con extension `pgvector` (imagen `pgvector/pgvector:pg17`,
distinta de la `postgres:17-alpine` usada en D01-K01 porque necesita el binario de la
extension compilado). Contenedor `--rm`, eliminado al terminar.

## Full-text + semantico

`0005_knowledge_search.sql`: `chunks.search_vector` es una columna GENERADA (nunca se
escribe a mano, imposible que quede desincronizada del texto real) con indice GIN.
`embeddings.value vector(1536)` con indice HNSW (`vector_cosine_ops`). La funcion
`knowledge.search_chunks()` combina ambos (40% full-text, 60% semantico) y **filtra por
`verification_status = 'verified'` de la fuente** — respeta la misma politica que K01,
no una regla nueva.

**Prueba real:** dos fuentes con el mismo termino ("ORCA... automatizacion") pero una
`verified` y otra `unverified`. `search_chunks('automatizacion', ...)` devolvio
**exactamente 1 fila** — la de la fuente verificada. La fuente sin verificar, aunque
contenia el mismo termino y hubiera hecho match en full-text, quedo excluida por el
`WHERE s.verification_status = 'verified'` de la funcion. Esto confirma el AC "respuestas
con referencias correctas" en su forma mas estricta: ni siquiera aparece como candidato.

## Presupuesto de contexto (8K tokens)

`platform/client-gateway/apps/api/src/modules/knowledge/domain/context-budget.ts`:
`compileContext()` pura, prioriza por relevancia (no por orden de llegada), reserva
1500 tokens para la salida del modelo por defecto, y **cada fragmento que no entra queda
en `excludedFragments` con su razon explicita** — nunca se trunca en silencio (regla
3.8 del diseno). `estimateTokens()` usa el estimador estandar de ~4 caracteres/token,
documentado como aproximacion honesta (no hay tokenizer real disponible en este modulo;
el tokenizer exacto depende de que modelo elija el router de M01).

5/5 tests unitarios: respeta el presupuesto (3 fragmentos grandes, solo cabe 1),
prioriza por relevancia sobre orden de entrada, razon explicita en cada exclusion,
estimador de tokens correcto, caso vacio sin fallar.

## Pendiente (fuera de alcance de K02)

- Generacion real de embeddings (llamar a un modelo via el router de M01 para convertir
  texto a vector) — aqui se probo la busqueda dado un vector ya calculado, no el pipeline
  de embedding en si.
- Conectar `compileContext()` al flujo real de `interpret-prompt.use-case.ts` (A02) — hoy
  son dos piezas verificadas por separado, no integradas end-to-end todavia.
