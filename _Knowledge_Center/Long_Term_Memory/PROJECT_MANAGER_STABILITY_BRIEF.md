# Resumen ejecutivo de estabilizacion y robustecimiento de `exo_api`

## Objetivo

Este documento resume los cambios ya realizados, las mejoras en curso y los criterios de control definidos para seguir fortaleciendo el proyecto sin afectar la operacion contable ni la logica actual del negocio.

El objetivo general es:

1. **Reducir errores operativos y contables**
2. **Mejorar estabilidad en procesos automaticos y manuales**
3. **Evitar falsos positivos y duplicidades**
4. **Preparar una base mas segura para mejoras de rendimiento y experiencia de usuario**

---

## Contexto del problema

El modulo `exo_api` participa en procesos sensibles de:

- creacion de borradores de facturas de cliente (shipper)
- creacion de facturas/ordenes para proveedor o transportista
- agrupacion de cargas por reglas contables y operativas
- sincronizacion con EXO

Durante la estabilizacion se identificaron varios riesgos reales:

1. **errores de concurrencia** en `create_account`
2. **filtros incorrectos por conduce** que dejaban cargas validas fuera del proceso
3. **conflictos por cargas ya facturadas o ya presentes en borrador**
4. **errores de interfaz** en listas de facturas
5. **casos de datos duplicados** que bloquean endurecimientos tecnicos como indices unicos

---

## Cambios ya aplicados

## 1. Aislamiento del registro de errores en produccion

Se aplico un hotfix para que el registro en `account.load.error` no rompa la transaccion principal cuando ocurre un error aguas arriba.

### Resultado

- se elimino el fallo secundario `InFailedSqlTransaction`
- el error real ahora queda visible
- esto mejora el diagnostico sin ocultar la falla de fondo

### Estado

- **aplicado en produccion**

---

## 2. Correccion del filtro por conduce en flujo shipper

Se detecto una regresion que hacia que, en ciertos casos, las cargas del shipper no se consultaran correctamente en EXO si el `order_num` venia con sufijos como `RETORNO`.

### Ajuste realizado

- se restauro el comportamiento correcto:
  - el filtro por conduce en la consulta EXO se mantiene para proveedor/transporte
  - el flujo shipper deja de excluir cargas validas por ese filtro prematuro

### Impacto

- evita que cargas reales del shipper queden fuera de la factura
- reduce omisiones funcionales

### Estado

- **validado en test**

---

## 3. Manejo mas seguro de conduces ya existentes

Se ajusto el flujo manual del shipper para evitar cortar el proceso en el primer conflicto detectado.

### Comportamiento anterior

- si un conduce ya existia, el proceso podia abortarse demasiado pronto
- eso impedia seguir agregando otros conduces validos del mismo grupo

### Comportamiento nuevo

- se siguen procesando los conduces validos del mismo grupo
- los conduces bloqueados no se incluyen
- al final se devuelve un mensaje resumen indicando:
  - cuales no se incluyeron
  - por que no se incluyeron
  - en que borrador o factura ya existen

### Estado

- **aplicado en produccion**

---

## Regla de negocio critica sobre duplicados

Para evitar falsos positivos, el proyecto ya tiene definida esta regla como obligatoria:

### Un conduce solo se considera duplicado si ya existe en un documento del mismo shipper.

Esto significa:

1. **Si el conduce esta en una factura de cliente del mismo shipper, si es duplicado**
2. **Si el conduce esta en una factura/compra de proveedor pero vinculada al mismo shipper, si es duplicado**
3. **Si el conduce aparece en una factura de proveedor de otro tercero, no se considera duplicado**

### Importancia

Esta regla protege la operacion de falsos positivos y evita bloquear facturacion valida de terceros no relacionados.

---

## Beneficios obtenidos hasta ahora

Los cambios ya hechos apuntan a cuatro mejoras concretas:

| Area | Mejora |
| --- | --- |
| Estabilidad | menos fallos secundarios y mejor diagnostico |
| Exactitud funcional | menos cargas omitidas por filtros incorrectos |
| Seguridad operativa | menor riesgo de bloquear cargas validas por conflictos parciales |
| Trazabilidad | mas claridad sobre por que una carga no fue incluida |

---

## Riesgos todavia abiertos

Aunque ya se mejoro parte importante del flujo, siguen existiendo temas sensibles que requieren trabajo controlado:

## 1. Concurrencia real en `create_account`

Sigue existiendo un problema de `SerializationFailure` en produccion.

### Riesgo

- reintentos agotados
- abortos del proceso
- potencial de generar colisiones al crear o actualizar drafts

### Decision tomada

- **no hacer un cambio grande en produccion sin reproducir y cerrar primero el caso en test**

---

## 2. Error de interfaz en listas de facturas

Existe un error de experiencia de usuario en algunas listas de `account.move`.

### Riesgo

- mala experiencia de usuario
- fallos de visualizacion por vistas heredadas o personalizaciones residuales

### Decision tomada

- corregir primero en test con la menor intervencion posible

### Ajuste relacionado ya aplicado

- se endurecio el template del portal en `v18/Modules/exo-odoo-18/addons/extra/exo_api/views/inherit/account/account_invoice_portal.xml`
- ahora el render no rompe si la factura no tiene `l10n_latam_document_type_id`
- la validacion JS de comprobante devuelve `false` si falta el prefijo o el numero

---

## 3. Bug en `/get_invoices` con `block_date_end = False`

Se aplico un ajuste local en `v18/Modules/exo-odoo-18/addons/extra/exo_api/controllers/account_controller.py` para manejar fechas nulas sin alterar la logica actual de filtrado.

### Ajuste realizado

- se agrego una conversion defensiva de fechas a timestamp en milisegundos
- `block_date_start`, `block_date_end`, `invoice_date` e `invoice_date_due` ahora devuelven `None` cuando el valor viene vacio
- `allow_to_approve_invoice` ahora se calcula como booleano explicito y retorna `False` si `block_date_end` esta vacio

### Estado

- **aplicado en repo local**
- **pendiente validar en `contabilidadtest`**

---

## 4. Revision estructurada de duplicados

Se necesita un flujo persistente para separar duplicados reales del flujo automatico y llevarlos a una bandeja de revision manual.

### Objetivo

- evitar ruido en facturacion
- no perder trazabilidad
- no borrar informacion sensible ni tocar datos posteados sin control

---

## 5. Cola controlada para sincronizacion EXO

Se agrego una cola interna en `exo_api` para encolar la ejecucion del wizard de cargas desde el modulo, con cron de procesamiento y control por parametro de configuracion.

### Ajuste realizado

- se creo `account.load.queue` para persistir tareas pendientes
- se agrego el cron `ir_cron_process_account_load_queue`
- el wizard `account.load` ahora puede encolar la sincronizacion via `action_execute_load` y `action_execute_load_provider`
- el endpoint `/api/account/create/` dejo de llamar una firma incompleta y ahora crea el wizard con parametros basicos
- el encolado se activa solo cuando `exo_api.enable_load_queue = True`

### Estado

- **aplicado en repo local**
- **pendiente validar en `contabilidadtest`**

---

## Enfoque estrategico aprobado

El trabajo pendiente se continuara por fases, con prioridad en estabilidad antes que velocidad.

## Fase 1 - Estabilidad tecnica

1. reproducir la concurrencia real de `create_account` en test
2. aislar el punto exacto de colision
3. diseñar un fix minimo y seguro

## Fase 2 - Experiencia de usuario y consistencia

1. corregir el renderer de listas de facturas
2. corregir el bug de `/get_invoices`
3. validar que no haya regresion funcional

## Fase 3 - Control de duplicados

1. implementar flujo de revision manual de cargas duplicadas
2. aplicar la regla de “duplicado solo dentro del mismo shipper”
3. evitar falsos positivos

## Fase 4 - Rendimiento controlado

1. validar integralmente `queue_job` en test
2. confirmar runner, configuracion y trazabilidad
3. evaluar rollout gradual en produccion

---

## Puntos no negociables

Para proteger la operacion y tener un desarrollo mas limpio, quedan definidos estos criterios obligatorios:

1. **No hacer cambios amplios de logica en produccion sin validarlos primero en `contabilidadtest`**
2. **Todo despliegue a produccion debe tener backup de archivo y backup de registros sensibles**
3. **Todo cambio debe quedar trazado en git y documentado**
4. **No alterar reglas de negocio ya confirmadas**
5. **No tocar datos posteados sin respaldo y sin criterio de impacto documentado**
6. **No priorizar rendimiento por encima de exactitud contable**
7. **No priorizar UX por encima de consistencia, idempotencia y trazabilidad**

---

## Criterio de exito del proyecto

Se considerara que esta linea de robustecimiento va bien si logramos:

1. menos errores operativos en facturacion automatica
2. menos reprocesos manuales por cargas omitidas o mal bloqueadas
3. menos falsos positivos por conduces
4. menos caidas o errores visibles para usuarios contables
5. mas capacidad de desplegar mejoras sin poner en riesgo la operacion

---

## Recomendacion para Project Management

La recomendacion es mantener este trabajo como una linea de **estabilizacion prioritaria**, porque impacta directamente:

- continuidad operativa
- confianza del usuario contable
- reduccion de incidentes
- capacidad futura de escalar con cola (`queue_job`) y mejoras de rendimiento

La estrategia correcta no es hacer cambios grandes rapidos en produccion, sino seguir una secuencia controlada:

1. reproducir
2. corregir en test
3. validar funcionalmente
4. respaldar
5. desplegar de forma minima y trazable

---

## Estado actual resumido

| Tema | Estado |
| --- | --- |
| Hotfix de errores transaccionales secundarios | Aplicado en produccion |
| Fix de filtro por conduce en shipper | Validado en test |
| Resumen final de conduces excluidos | Aplicado en produccion |
| Regla de duplicado por mismo shipper | Definida y obligatoria |
| Fix de concurrencia real en `create_account` | Pendiente |
| Fix renderer listas facturas | Ajuste parcial aplicado localmente, pendiente validar en test |
| Fix `/get_invoices` con fecha nula | Aplicado localmente, pendiente validar en test |
| Flujo formal de revision de duplicados | Pendiente |
| Cola controlada de sincronizacion EXO | Aplicado localmente, pendiente validar en test |
| Rollout de `queue_job` en produccion | Pendiente |
