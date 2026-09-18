# E01: Verificacion real de la cola durable (outbox pattern)

**Fecha:** 2026-09-10
**Metodo:** Postgres real desechable (mismo patron de D01-K03).

## AC real: "reinicio no pierde tareas aceptadas"

1. Se insertaron 2 tareas en `automation.outbox` y se **cerro la conexion** (simula el
   proceso que las acepto terminando abruptamente, sin llegar a despacharlas).
2. Se abrio una conexion **completamente nueva** (simula el dispatcher reiniciando) y se
   conto cuantas seguian `pending` -> **2**, ninguna se perdio. Esto es la consecuencia
   directa de que la tarea nunca vivio solo en memoria: se escribio a disco en la misma
   transaccion que el hecho que la origino (patron transactional outbox real, no
   simulado con un mock de cola).

## AC real: reclamo sin duplicados bajo concurrencia REAL

`automation.claim_next_outbox_task()` usa `SELECT ... FOR UPDATE SKIP LOCKED` — se probo
con **dos procesos `psql` separados corriendo en paralelo** (no secuencial), cada uno
invocando la funcion con su propio identificador de dispatcher:

- `dispatcher-A` reclamo la tarea `...002`
- `dispatcher-B` reclamo la tarea `...001`

Cada uno se quedo con una tarea DISTINTA — `SKIP LOCKED` hizo que el segundo dispatcher
saltara la fila que el primero ya habia bloqueado, en vez de esperar y terminar
procesando la misma tarea dos veces (que es exactamente el bug que este mecanismo existe
para evitar).

## Decisiones de diseno

- `orca_dispatcher` (creado sin permisos en D01) recibe aqui sus primeros GRANTs reales:
  `SELECT, UPDATE` sobre `outbox` y `EXECUTE` sobre `claim_next_outbox_task` — nada mas.
  No puede leer `runs`/`workflows` directamente; solo interactua con la cola.
- `orca_api` puede `INSERT`/`SELECT`/`UPDATE` en `outbox` (encola tareas al aceptar una
  request) pero no tiene `EXECUTE` sobre `claim_next_outbox_task` — reclamar tareas es
  responsabilidad exclusiva del dispatcher, no de la capa HTTP.

## Pendiente (fuera de alcance de E01)

- Integracion con `pg-boss` (mencionado en el diseno como la libreria de cola elegida) —
  esta entrega implementa el patron transactional outbox + reclamo atomico directamente
  en SQL, verificado de forma independiente de cualquier libreria. Envolver esto en
  pg-boss (que internamente usa un patron similar) es trabajo de integracion posterior,
  no cambia la garantia ya verificada aqui.
- Reintentos/dead-letter para tareas `failed` — es E02 (idempotencia y reconciliacion de
  efectos), no E01.
