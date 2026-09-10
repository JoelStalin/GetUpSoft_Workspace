# K03: Verificacion real del preprocesador y de la inmutabilidad de prompts publicados

**Fecha:** 2026-09-10

## Preprocesador (`prompt-normalizer.ts`)

21 tests: **15 frases reales en español con errores ortograficos tipicos** (muestra
representativa por categoria del AC "50 solicitudes en español" — honesto sobre el
alcance: verifica PRESERVACION de cifras/codigo/rutas/negaciones, no correccion
ortografica automatica, que requeriria un diccionario real fuera de alcance de esta
funcion) + 6 tests de deteccion de cada tipo de span protegido. Las 15 frases cubren:
cifras enteras y decimales, montos con simbolo `$`, rutas Windows y Unix, rutas relativas
(`./...`), codigo entre backticks, y las 6 palabras de negacion declaradas
(no/nunca/jamás/sin/ningún/tampoco). **21/21 en verde.**

## Inmutabilidad real de prompts publicados (`0006_prompt_version_immutability.sql`)

A diferencia de `workflow_versions` (D03, dejada como convencion de permisos porque D02
todavia no existia), aqui SI se forzo con un trigger real — D02 (RLS) ya estaba
disponible cuando se construyo esta tarea, asi que no hay razon para dejarlo solo
documentado.

**Verificado con Postgres real** (mismo patron de D01-K02, contenedor `--rm`
desechable):

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | `UPDATE` sobre una version en `draft` | Permitido | ✅ sin error |
| 2 | Publicar la version (`status='published'`) | Permitido | ✅ sin error |
| 3 | `UPDATE content_hash` sobre la version YA publicada | DENEGADO | ✅ `ya esta publicada (inmutable): no se puede modificar, cree una version nueva` |
| 4 | Intentar "despublicar" (`status='draft'`) una version publicada | DENEGADO TAMBIEN — no solo el contenido, el propio estado de publicacion es irreversible | ✅ mismo error del trigger |

El caso 4 es deliberado: si solo se bloqueara el cambio de `content_hash` pero se
permitiera revertir `status` a `draft`, alguien podria "despublicar", editar, y volver a
publicar — rompiendo la garantia de inmutabilidad por la puerta de atras. El trigger
bloquea CUALQUIER `UPDATE` sobre una fila cuyo `status` anterior era `published`, sin
excepcion.
