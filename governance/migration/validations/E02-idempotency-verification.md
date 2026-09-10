# E02: Verificacion real de idempotencia y reconciliacion de efectos

**Fecha:** 2026-09-10
**Metodo:** Postgres real desechable, mismo patron de D01-E01.

## Por que el `UNIQUE(idempotency_key)` de D03 no era suficiente

D03 ya garantizaba que la misma clave no se pudiera insertar dos veces — pero eso
rechaza CUALQUIER reintento, incluso el reintento honesto de un cliente cuya respuesta se
perdio en la red (el run SI se creo, el cliente nunca vio la confirmacion, reintenta con
la misma clave). El diseno original exige distinguir eso de un intento real de reusar la
clave con contenido distinto: **"reutilizar una clave con otro contenido devuelve
conflicto"** — implica que reutilizarla con el MISMO contenido no debe fallar.

## `automation.accept_run()`

Funcion que antes de insertar, busca si la clave ya existe:
- No existe -> inserta, `outcome = 'created'`.
- Existe con el MISMO `input_hash` -> devuelve el `run_id` YA EXISTENTE, `outcome =
  'already_accepted'` — nunca inserta una segunda fila, nunca re-ejecuta el efecto.
- Existe con OTRO `input_hash` -> `RAISE EXCEPTION` explicito con ambos hashes en el
  mensaje (el esperado y el recibido), para que quien depure entienda exactamente que
  cambio.

## Verificacion real (4 casos, Postgres real)

| # | Caso | Esperado | Resultado real |
|---|---|---|---|
| 1 | Primera entrega de la clave `idem-e02-1` | Crea el run | ✅ `outcome = created`, `run_id = c2b84ecb-...` |
| 2 | **Doble entrega**: misma clave, mismo `input_hash` | Devuelve el MISMO `run_id`, no crea nada nuevo | ✅ `run_id = c2b84ecb-...` (identico al de test 1), `outcome = already_accepted` |
| 3 | Contar filas reales con esa clave tras la doble entrega | 1 (el efecto NO se duplico) | ✅ `filas_reales = 1` |
| 4 | Misma clave, `input_hash` DISTINTO | Conflicto explicito | ✅ `ERROR: idempotency_key idem-e02-1 ya se uso con un payload distinto (input_hash esperado payload-hash-a, recibido payload-hash-B-DISTINTO)` |

El test 2+3 juntos son la prueba real del AC "doble entrega controlada": no basta con
que la segunda llamada no falle — hay que confirmar que tampoco creo un efecto
duplicado, y el conteo de filas lo confirma directamente contra la tabla real.

## Pendiente (fuera de alcance de E02)

- Reconciliacion de efectos EXTERNOS (ej. un mensaje de WhatsApp que ya se envio antes de
  que la respuesta HTTP confirmara el envio) — esta tarea cubre la idempotencia a nivel
  de aceptacion del run en la base de datos; la idempotencia de efectos de terceros
  (envio real de un mensaje, una impresion fisica) depende de cada integracion
  especifica y ya esta parcialmente cubierta en CareerAI (`whatsapp.mjs`,
  `idempotencyKey()`, verificado en sesiones anteriores de esta rama).
