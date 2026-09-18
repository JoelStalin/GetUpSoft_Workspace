# Prompt maestro integral para EasyCounting + Odoo 19 Enterprise Accounting + DGII + certificación automática + monitoreo en vivo en TEST

## Rol y mandato operativo

Vas a trabajar sobre este repositorio:

**https://github.com/JoelStalin/EasyCounting.git**

Tu tarea no es dar recomendaciones generales ni opiniones de arquitectura. Tu tarea es **auditar, rediseñar, refactorizar, endurecer, implementar, probar, documentar y dejar evidencia reproducible**.

Debes trabajar con mentalidad de:

- software empresarial estable
- integración fiscal crítica
- contabilidad auditable
- compatibilidad real con Odoo 19 Enterprise
- automatización de certificación DGII
- observabilidad completa del proceso
- trazabilidad de extremo a extremo

No cierres la tarea con sugerencias blandas. No finalices hasta haber:

- inspeccionado el repositorio completo
- identificado la arquitectura real
- identificado el flujo contable real
- identificado el flujo fiscal real
- auditado dependencias y configuración
- detectado causa raíz y causas secundarias
- ejecutado refactorización integral donde corresponda
- implementado o corregido la integración DGII
- automatizado pruebas y certificación al máximo posible
- dejado monitoreo en vivo del proceso en TEST
- probado con evidencia reproducible
- documentado decisiones, riesgos y resultados

No inventes estructura. Verifica primero.
No asumas nombres de modelos, tablas, servicios ni endpoints. Descúbrelos.
No supongas el estado del módulo accounting de Odoo Enterprise. Debes inspeccionarlo y evaluarlo por evidencia.

---

# Objetivo final no negociable

Debes dejar una solución robusta para que **EasyCounting** sea **100% compatible funcional, contable, fiscal y operativamente con Odoo 19 Enterprise**, específicamente con el módulo **Accounting / Enterprise**, y además dejar la integración con **DGII** lista para operación seria y certificación reproducible.

## Resultado final obligatorio

La solución debe cubrir simultáneamente:

1. **Refactorización completa del dominio contable** necesario para compatibilidad real entre EasyCounting y Odoo 19 Enterprise.
2. **Compatibilidad 100% con la plataforma EasyCounting**, sin parches frágiles ni adaptaciones temporales.
3. **Integración DGII correcta y auditable**.
4. **Certificación automática DGII** en ambiente test/certificación en la mayor medida técnicamente posible.
5. **Visualización en vivo del proceso** mientras se ejecutan pruebas o certificaciones en TEST.
6. **Pruebas reales de facturas por 0.001** para validar flujos completos.
7. **Cobertura de todos los tipos de comprobante soportados por la implementación objetivo**.
8. **Persistencia, trazabilidad, observabilidad, seguridad y evidencia reproducible**.

---

# Principios obligatorios de ingeniería

Toda decisión debe cumplir estas reglas:

- estabilidad primero
- exactitud contable primero
- cumplimiento fiscal primero
- evidencia antes que afirmaciones
- separación estricta de ambientes
- idempotencia donde aplique
- manejo explícito de errores
- trazabilidad completa
- consistencia de estados
- diseño desacoplado
- pruebas automatizadas obligatorias
- rollback claro
- documentación durable

Queda prohibido:

- asumir que algo funciona sin prueba reproducible
- declarar compatibilidad sin validación real contra Odoo 19 Enterprise
- declarar compatibilidad con EasyCounting por simple mapeo superficial
- ocultar errores DGII
- dejar errores silenciosos
- mezclar test con producción
- exponer credenciales, certificados o secretos
- mantener deuda técnica crítica sin registrar
- cerrar tareas con frases ambiguas

---

# FASE 0 — Auditoría total del repositorio EasyCounting

Antes de modificar código, inspecciona el repositorio completo.

## Debes localizar exactamente

- stack real del proyecto
- estructura general del repo
- entrypoints
- arquitectura real
- módulos de dominio
- componentes de accounting si existen
- modelos de facturación
- modelos contables
- modelos fiscales
- integraciones externas
- servicios actuales
- variables de entorno reales
- configuración por ambiente
- middlewares
- jobs, colas o workers
- logging y observabilidad
- mecanismos de validación
- manejo de errores
- autenticación/autorización
- endpoints o servicios DGII existentes
- integración Odoo existente si ya hay algo
- procesos de import/export contable
- reglas de impuestos
- numeraciones fiscales
- estructura de documentos fiscales
- pruebas existentes
- Docker, CI/CD, scripts y despliegue

## Entregables de esta fase

Genera una auditoría inicial con:

- mapa del repo
- mapa funcional
- mapa contable
- mapa fiscal
- mapa de dependencias
- flujo actual de facturación
- flujo actual de contabilidad
- flujo actual DGII
- huecos de compatibilidad con Odoo 19 Enterprise
- deuda técnica visible
- riesgos operativos
- riesgos contables
- riesgos fiscales
- archivos implicados
- causa raíz preliminar
- causas secundarias preliminares

No empieces a editar antes de cerrar esta fase.

---

# FASE 1 — Auditoría profunda de Odoo 19 Enterprise Accounting

Debes analizar el comportamiento y los contratos funcionales necesarios del módulo **Accounting** de **Odoo 19 Enterprise** para garantizar compatibilidad real con EasyCounting.

## Debes verificar y mapear

- estructura funcional del módulo accounting
- modelo contable objetivo
- journals
- invoices / moves
- move lines
- taxes
- tax groups
- fiscal positions
- partners
- products
- currencies
- payment terms
- payment registers
- reconciliación
- secuencias
- estados de factura
- borrador / publicado / cancelado
- notas de crédito
- notas de débito si aplica
- pagos parciales
- impuestos incluidos / excluidos
- redondeos
- multi-company si aplica
- multi-currency si aplica
- estructura de campos clave
- reglas de extensión enterprise relevantes
- eventos o hooks necesarios
- API o servicios de integración si existen
- limitaciones o cambios relevantes entre versiones

## Resultado obligatorio

Debes producir una **matriz de compatibilidad EasyCounting ↔ Odoo 19 Enterprise Accounting** con:

- entidad origen
- entidad destino
- reglas de transformación
- validaciones
- riesgos
- gaps
- estrategia de compatibilidad

No aceptes compatibilidad parcial. Debes dejar identificados y corregidos todos los gaps críticos.

---

# FASE 2 — Refactorización completa del accounting para compatibilidad 100% con EasyCounting

Este punto es obligatorio.

Debes realizar un **refactor completo del dominio accounting** necesario para que el módulo Enterprise de Odoo 19 quede 100% compatible con la plataforma EasyCounting.

## La refactorización debe cubrir como mínimo

- estructura del dominio contable
- contratos entre capas
- mapping entre modelos
- normalización de estados
- normalización de impuestos
- normalización de comprobantes
- normalización de clientes y productos
- transformación de facturas y asientos
- manejo de descuentos
- manejo de redondeos
- manejo de impuestos compuestos si existen
- numeración y secuencias
- conciliación de importes
- consistencia de débitos y créditos
- persistencia duradera
- idempotencia de sincronizaciones
- trazabilidad por documento
- correlación por operación
- desacople entre dominio, infraestructura y transporte

## No aceptes una integración basada solo en adaptadores superficiales

Si el diseño actual está roto o acoplado, debes:

- rediseñar
- extraer servicios
- separar responsabilidades
- consolidar reglas contables
- eliminar duplicación
- unificar validaciones
- corregir naming inconsistente
- corregir flujos rotos
- reemplazar componentes frágiles

## Resultado obligatorio

EasyCounting debe poder interoperar con Odoo 19 Enterprise Accounting con equivalencia real en:

- factura cliente
- factura proveedor si aplica
- nota de crédito
- nota de débito si aplica
- impuestos
- pago
- estado
- asientos relacionados
- historial
- auditoría

---

# FASE 3 — Reglas obligatorias de software estable

Debes endurecer el sistema completo con reglas reales de estabilidad.

## Debes implementar o verificar

- tipado consistente
- DTOs o schemas explícitos
- validación de entrada en frontera
- manejo centralizado de errores
- logs estructurados
- correlación por requestId / operationId / traceId
- timeouts configurables
- retries con backoff donde aplique
- locks o guardas contra doble procesamiento
- idempotencia en envío y sincronización
- separación estricta por ambientes
- configuración inyectable
- servicios desacoplados
- pruebas automáticas
- healthchecks
- auditoría de eventos
- monitoreo de flujos críticos
- limpieza de código muerto
- eliminación de dependencias innecesarias

---

# FASE 4 — Integración DGII completa y auditada

Debes inspeccionar el estado real de la integración DGII.

## Debes localizar

- autenticación
- endpoints
- transformación a payload fiscal
- firma digital cuando aplique
- envío de e-CF o documentos relacionados
- recepción de respuesta
- manejo de TrackId
- consulta de estado
- persistencia de estado
- reintentos
- timeouts
- errores técnicos
- errores fiscales
- separación test/cert/prod

## Si no existe o está incompleta

Debes implementar una arquitectura robusta con capas separadas:

- `domain/`
- `application/`
- `infrastructure/dgii/`
- `presentation/`
- `observability/`
- `tests/`

## Flujo DGII obligatorio

1. preparar datos fuente
2. validar reglas de negocio
3. validar reglas fiscales
4. construir payload fiscal
5. firmar cuando aplique
6. registrar intento local
7. enviar a DGII
8. registrar respuesta inmediata
9. extraer TrackId
10. persistir estado y evidencia
11. consultar estado posterior
12. actualizar estado final o intermedio
13. exponer historial técnico completo
14. permitir reintento controlado si hubo fallo recuperable

## Debes manejar explícitamente

- payload inválido
- certificado inválido
- credenciales ausentes
- timeout
- rechazo DGII
- respuesta incompleta
- TrackId ausente
- divergencia entre estado local y remoto
- doble envío
- reenvío accidental
- servicio externo caído
- inconsistencias entre test y producción

---

# FASE 5 — Certificación automática DGII

Quiero que la certificación quede automatizada al máximo posible.

## Debes construir o corregir

- scripts de preparación del ambiente de certificación
- carga segura de credenciales y certificados
- dataset reproducible de pruebas
- secuencia automatizada de ejecución
- envío automático
- consulta automática de resultados
- consolidación automática de evidencias
- reporte técnico automático por corrida

## Separación obligatoria

Debes dejar separación estricta entre:

- `DGII_ENV=local`
- `DGII_ENV=test`
- `DGII_ENV=cert`
- `DGII_ENV=prod`

Nunca mezcles:

- endpoints
- certificados
- tokens
- secuencias
- numeración
- respuestas
- evidencias

## Si existe un bloqueo externo

Debes:

- identificarlo exactamente
- automatizar todo lo posible alrededor de ese bloqueo
- documentar el paso manual residual
- registrar la evidencia del paso manual

---

# FASE 6 — Pruebas reales con facturas de 0.001

Este punto es obligatorio.

Debes ejecutar **pruebas reales de factura con monto 0.001** para validar el comportamiento integral del sistema, del módulo accounting y del flujo DGII en el entorno que corresponda.

## Reglas obligatorias para estas pruebas

- usar datos controlados y auditables
- registrar el ambiente exacto usado
- registrar tipo de comprobante
- registrar moneda
- registrar impuestos aplicados
- registrar total bruto, impuesto y total final
- registrar redondeos
- registrar respuesta del sistema
- registrar respuesta DGII si aplica
- registrar resultado contable en Odoo 19
- registrar resultado funcional en EasyCounting
- registrar diferencias detectadas

## Debes verificar especialmente

- precisión decimal
- redondeo contable
- redondeo fiscal
- impuestos mínimos
- rechazo por límites del sistema externo
- consistencia entre UI, backend, DB y contabilidad
- persistencia correcta de importes muy pequeños
- serialización correcta del valor 0.001
- compatibilidad con currency precision
- impacto en journal entries
- impacto en impuestos y subtotales

## Si alguna plataforma no acepta 0.001

Debes:

- identificar la restricción exacta
- documentar dónde ocurre
- registrar evidencia
- implementar validación o estrategia de compatibilidad
- definir fallback controlado

No ocultes ni suavices esa incompatibilidad.

---

# FASE 7 — Cobertura de todos los tipos de comprobante

Debes ejecutar y validar el flujo con **todos los tipos de comprobante soportados por la solución objetivo**.

## Debes identificar y cubrir

Todos los tipos de comprobante relevantes disponibles en el dominio de EasyCounting + Odoo 19 Enterprise + DGII, incluyendo al menos los que apliquen dentro del proyecto:

- factura fiscal
- factura de consumo
- nota de crédito
- nota de débito
- comprobantes especiales que apliquen
- comprobantes gubernamentales si aplican
- comprobantes de exportación si aplican
- comprobantes de pago o documentos relacionados si aplican

## Para cada tipo de comprobante debes validar

- creación
- validación
- publicación
- transformación al modelo interno
- transformación al modelo Odoo 19
- transformación al payload DGII
- envío si aplica
- respuesta
- persistencia de estado
- monitoreo en vivo
- reversión o corrección si aplica
- evidencia final

## Resultado obligatorio

Debe existir una matriz completa por tipo de comprobante con:

- tipo
- flujo cubierto
- reglas aplicadas
- restricciones
- resultado
- evidencia
- gaps restantes si existieran

---

# FASE 8 — Monitoreo en vivo del proceso en TEST

Este punto es obligatorio.

Cuando el sistema esté ejecutando pruebas o certificación en ambiente TEST o CERT, debe mostrar el proceso **en vivo**, sin necesidad de revisar logs del servidor.

## Debes implementar un panel o consola en vivo con:

- operationId
- correlationId
- usuario iniciador
- ambiente
- tipo de comprobante
- estado actual
- timestamp por evento
- validaciones ejecutadas
- payload preparado
- firma ejecutada
- solicitud emitida
- respuesta recibida
- TrackId
- consultas posteriores de estado
- duración por etapa
- duración total
- errores técnicos
- errores fiscales
- transiciones de estado
- evidencia descargable

## Estrategia técnica permitida

Usa una estrategia real según el stack:

- WebSocket
- Server-Sent Events
- polling controlado con contrato claro
- cola + canal realtime
- streaming de eventos estructurados

No uses recarga manual como simulación de “en vivo”.

## Estados mínimos obligatorios

- QUEUED
- VALIDATING
- BUILDING_PAYLOAD
- SIGNING
- SENDING_TO_DGII
- DGII_RESPONSE_RECEIVED
- TRACKID_REGISTERED
- QUERYING_TRACK_STATUS
- SYNCING_TO_ODOO
- SYNCED_TO_ODOO
- ACCEPTED
- ACCEPTED_CONDITIONAL si aplica
- REJECTED
- FAILED_TECHNICAL
- RETRYING
- CANCELLED

---

# FASE 9 — Persistencia y trazabilidad integral

Debes dejar persistencia durable para reconstruir cualquier operación completa.

## Debes registrar como mínimo

- operationId
- correlationId
- requestId si aplica
- usuario
- ambiente
- documento fuente
- tipo de comprobante
- payload hash
- respuesta inmediata
- TrackId
- estado actual
- historial de estados
- timestamps
- errores
- reintentos
- latencias
- resultado en EasyCounting
- resultado en Odoo 19
- evidencia asociada

Cada operación debe poder reconstruirse sin depender de memoria humana ni de logs efímeros.

---

# FASE 10 — Seguridad y secretos

Debes endurecer:

- `.env`
- secretos de CI/CD
- certificados
- permisos
- masking de logs
- ocultación de datos sensibles en UI
- control de acceso al panel técnico
- roles y segregación
- protección de rutas administrativas
- validaciones de entrada
- rate limiting si aplica
- CSRF/XSS/SSRF según el stack
- protección de endpoints de pruebas y certificación

Queda prohibido:

- exponer secretos en frontend
- imprimir certificados en logs
- dejar credenciales en el repo
- exponer respuestas sensibles sin control de acceso

---

# FASE 11 — Auditoría de dependencias

Debes revisar todas las dependencias y clasificarlas en:

- esenciales y bien usadas
- esenciales pero mal usadas
- faltantes y necesarias
- presentes pero innecesarias
- incompatibles con estabilidad
- incompatibles con seguridad
- incompatibles con integración DGII
- incompatibles con Odoo 19 Enterprise
- candidatas a reemplazo

## Presta atención especial a

- validación
- auth
- crypto / firma
- XML
- HTTP client
- retry/backoff
- logging
- tracing
- realtime
- colas
- testing
- Docker
- observabilidad
- librerías Odoo relacionadas

No agregues librerías por moda. Agrega solo lo estrictamente necesario.

---

# FASE 12 — Dockerización y operación reproducible

Debes revisar y corregir:

- Dockerfile
- docker-compose
- `.dockerignore`
- variables por ambiente
- healthchecks
- volúmenes
- montaje seguro de certificados
- timezone
- reloj del sistema
- persistencia de artefactos
- logs
- monitoreo
- ejecución no-root cuando aplique

## Debe quedar resuelto

- desarrollo local
- test
- certificación
- producción

## Resultado esperado

Debe ser posible levantar el sistema y ejecutar el flujo contable-fiscal controlado de forma reproducible.

---

# FASE 13 — Pruebas obligatorias

Debes crear y ejecutar pruebas reales.

## Unitarias

- validación de datos
- transformación de modelos
- transformación EasyCounting ↔ Odoo 19
- transformación a payload DGII
- parser de respuestas
- máquina de estados
- cálculo de impuestos
- manejo de redondeos
- manejo de 0.001
- idempotencia
- redacción de logs

## Integración

- cliente DGII con mocks o sandbox
- persistencia de operaciones
- sincronización con Odoo 19
- flujo de estados
- API o canal del panel en vivo
- autenticación y roles del panel técnico
- sincronización de comprobantes

## E2E obligatorias

1. iniciar flujo con comprobante en TEST
2. generar factura real de 0.001
3. reflejarla en EasyCounting
4. reflejarla en Odoo 19 Enterprise Accounting
5. mostrar el progreso en vivo
6. enviar a DGII si aplica
7. persistir TrackId
8. consultar estado
9. reflejar resultado final
10. descargar evidencia
11. validar separación de ambientes
12. repetir para todos los tipos de comprobante

## Artefactos obligatorios

Guardar artefactos por ejecución en:

`tests/artifacts/YYYY-MM-DD_HH-mm-ss/`

Incluir:

- screenshots
- logs relevantes
- json o markdown del resultado
- operationId
- ambiente
- tipo de comprobante
- monto
- evidencia DGII
- evidencia EasyCounting
- evidencia Odoo 19
- pass/fail

---

# FASE 14 — Investigación técnica y decisiones con fuente

Antes de cerrar cualquier diseño importante, consulta documentación oficial y actualizada sobre:

- DGII e-CF
- proceso de certificación DGII
- estados y TrackId
- Odoo 19 Enterprise Accounting
- modelo contable real aplicable
- mecanismo realtime más correcto para el stack
- seguridad
- Docker y despliegue

## Regla de evidencia

Cada decisión importante debe registrar:

- fuente
- fecha
- tema
- conclusión práctica
- archivo afectado
- impacto

---

# FASE 15 — Memoria técnica persistente

Debes crear una memoria durable y actualizable.

## Estructura obligatoria

```text
project-memory/
  00-project-overview.md
  01-repo-map.md
  02-dependency-audit.md
  03-runtime-architecture.md
  04-accounting-compatibility-matrix.md
  05-dgii-flow-audit.md
  06-root-cause.md
  07-full-accounting-refactor.md
  08-dgii-integration-architecture.md
  09-live-test-observability.md
  10-security-model.md
  11-docker-architecture.md
  12-testing-strategy.md
  13-real-invoice-0.001-tests.md
  14-comprobante-matrix.md
  15-env-template.md
  16-change-log.md
  17-open-questions.md
  18-next-steps.md
  MEMORY_RULES.md
  templates/
    decision-template.md
    test-run-template.md
    change-entry-template.md
    conversation-template.md
  decisions/
    DEC-001-*.md
    DEC-002-*.md
  conversations/
    YYYY-MM-DD_agent-session_001.md
  evidence/
    screenshots-index.md
    test-runs-index.md
    dgii-runs-index.md
    odoo-sync-runs-index.md
```

## Debes registrar

- estado inicial
- flujo detectado
- hallazgos
- causa raíz
- causas secundarias
- decisiones
- cambios exactos
- pruebas ejecutadas
- evidencias
- riesgos
- deuda técnica residual
- siguientes pasos

---

# Criterio de ejecución obligatorio

Secuencia obligatoria:

1. inspecciona el repo completo
2. identifica arquitectura real
3. identifica flujo contable real
4. identifica flujo fiscal real
5. identifica estado actual de integración DGII
6. identifica estado actual de compatibilidad con Odoo 19 Enterprise
7. audita dependencias
8. audita Docker y ambientes
9. detecta causa raíz y deuda técnica
10. diseña solución robusta
11. ejecuta refactor completo del accounting
12. implementa compatibilidad 100% con EasyCounting
13. implementa o corrige integración DGII
14. automatiza certificación
15. habilita visualización en vivo
16. ejecuta pruebas reales de 0.001
17. ejecuta pruebas con todos los tipos de comprobante
18. documenta
19. deja evidencia
20. completa checklist final

No te quedes en recomendaciones. Ejecuta.

---

# Criterio de finalización no negociable

No termines hasta verificar con evidencia:

- [ ] se auditó el repo completo
- [ ] se identificó la arquitectura real
- [ ] se auditó el estado de dependencias
- [ ] se auditó la compatibilidad actual con Odoo 19 Enterprise
- [ ] se construyó la matriz de compatibilidad EasyCounting ↔ Odoo 19
- [ ] se detectó la causa raíz principal
- [ ] se detectaron causas secundarias
- [ ] se realizó refactorización completa del accounting necesaria
- [ ] el sistema quedó 100% compatible con EasyCounting
- [ ] la integración DGII quedó verificada o implementada correctamente
- [ ] la certificación DGII quedó automatizada al máximo posible
- [ ] el sistema muestra el proceso en vivo durante TEST
- [ ] se visualizan eventos, tiempos, respuestas y estados
- [ ] el TrackId queda persistido
- [ ] el historial de estados queda persistido
- [ ] se ejecutaron pruebas reales de 0.001
- [ ] se validaron todos los tipos de comprobante
- [ ] se validó el resultado en Odoo 19 Enterprise
- [ ] se validó el resultado en EasyCounting
- [ ] los errores quedan auditados
- [ ] los secretos quedaron protegidos
- [ ] la separación entre local/test/cert/prod quedó aplicada
- [ ] Docker fue validado
- [ ] las pruebas unitarias fueron ejecutadas
- [ ] las pruebas de integración fueron ejecutadas
- [ ] las pruebas E2E fueron ejecutadas
- [ ] los artefactos fueron guardados
- [ ] la memoria técnica fue creada
- [ ] el changelog detallado fue completado
- [ ] existe evidencia reproducible
- [ ] la aplicación no quedó degradada por los cambios

---

# Formato de respuesta final obligatorio

Tu respuesta final debe venir exactamente en este orden:

## A. Auditoría inicial del repo
## B. Auditoría de dependencias
## C. Flujo contable actual detectado
## D. Flujo fiscal actual detectado
## E. Compatibilidad actual con Odoo 19 Enterprise
## F. Flujo DGII detectado
## G. Causa raíz principal
## H. Causas secundarias
## I. Estrategia técnica elegida
## J. Matriz de compatibilidad EasyCounting ↔ Odoo 19
## K. Archivos modificados
## L. Cambios implementados
## M. Refactorización completa del accounting realizada
## N. Diseño final de integración DGII
## O. Diseño final de certificación automática
## P. Diseño final de monitoreo en vivo en TEST
## Q. Resultado de pruebas reales de 0.001
## R. Resultado por tipo de comprobante
## S. Reglas de estabilidad aplicadas
## T. Seguridad aplicada
## U. Refactorización Docker realizada
## V. Pruebas ejecutadas
## W. Evidencias generadas
## X. Memoria técnica creada
## Y. Riesgos pendientes
## Z. Checklist final completo
## AA. Cómo reproducir local, test, certificación y producción

---

# Reglas de lenguaje y comportamiento

Queda prohibido cerrar con:

- “podría ser”
- “parece que”
- “sería recomendable”
- “quizás”
- “faltaría validar”
- “te sugiero”
- “probablemente”
- “no puedo verificar”

Debes:

- inspeccionar
- medir
- corregir
- refactorizar
- probar
- registrar
- evidenciar
- cerrar con resultados concretos

---

# Inicio obligatorio

Empieza ya y trabaja en este orden exacto:

1. inspecciona el repo completo
2. identifica el flujo funcional real
3. identifica el flujo contable real
4. identifica el flujo fiscal real
5. identifica el estado de compatibilidad con Odoo 19 Enterprise
6. identifica el flujo DGII real
7. identifica estado, persistencia y observabilidad actuales
8. audita dependencias
9. inspecciona Docker y configuración por ambiente
10. entrega auditoría
11. ejecuta refactor completo del accounting
12. habilita compatibilidad total con EasyCounting
13. implementa o corrige DGII
14. habilita visualización en vivo en TEST
15. automatiza certificación
16. ejecuta pruebas reales de 0.001
17. ejecuta pruebas de todos los tipos de comprobante
18. documenta
19. completa checklist final
