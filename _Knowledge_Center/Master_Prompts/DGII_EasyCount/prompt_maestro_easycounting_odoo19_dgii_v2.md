# Prompt maestro para endurecimiento integral de EasyCounting + Odoo 19 Enterprise Accounting + DGII + automatización controlada por navegador

## Rol y modo de ejecución obligatorio

Vas a trabajar sobre los repositorios y módulos relevantes de:

- **EasyCounting**
- **Odoo 19 Enterprise** con foco en **Accounting / account / account_edi / localización e integraciones relacionadas**
- Integración con la **DGII** de República Dominicana para **e-CF**, certificación, pruebas, consulta de estado y operación controlada

Tu trabajo no es opinar. Tu trabajo es:

**auditar, refactorizar, endurecer, integrar, probar, documentar, instrumentar y dejar evidencia reproducible.**

No cierres la tarea con sugerencias blandas. No termines hasta haber:

- inspeccionado el repo completo
- identificado la arquitectura real
- detectado el flujo funcional real
- corregido fallas encontradas
- refactorizado la parte contable necesaria
- garantizado compatibilidad operativa con EasyCounting
- implementado o corregido el flujo DGII
- automatizado la certificación al máximo posible por medios permitidos
- dejado observabilidad en vivo en TEST
- ejecutado pruebas verificables
- documentado decisiones
- generado trazabilidad persistente
- dejado evidencia concreta de funcionamiento

No inventes arquitectura. Verifica primero.
No asumas nombres de rutas, tablas, modelos ni servicios. Descúbrelos.
No asumas que Odoo 19 Enterprise usa exactamente la misma organización interna que versiones anteriores. Debes inspeccionarlo.
No asumas cómo opera la DGII en este entorno. Debes localizar el flujo oficial vigente antes de decidir integración.

---

## Objetivo final no negociable

Debes dejar el sistema con una solución robusta, estable y reproducible para lo siguiente:

1. Auditar y estabilizar todo el sistema como software de producción seria.
2. Hacer un **refactor completo del módulo de Accounting de Odoo 19 Enterprise** en la porción necesaria para integrarlo de forma limpia con EasyCounting.
3. Garantizar compatibilidad funcional y técnica **100% con EasyCounting** en:
   - partner/account mapping
   - impuestos
   - diarios
   - secuencias
   - estados de documentos
   - conciliación contable cuando aplique
   - documentos fiscales y electrónicos
   - eventos de emisión, consulta y respuesta
4. Garantizar que la integración con la **DGII** quede diseñada o implementada correctamente para:
   - autenticación
   - firma cuando aplique
   - recepción/envío
   - consulta de estados
   - manejo de TrackId
   - persistencia de resultados
   - reintentos controlados
   - trazabilidad integral
5. Dejar la **certificación contra la DGII automatizada** al máximo posible por medios oficiales o controlados.
6. Habilitar un modo **TEST / certificación** donde el sistema **muestre en vivo el proceso completo**.
7. Ejecutar **pruebas reales con monto 0.001** donde el ambiente, la normativa del sandbox y la configuración lo permitan, y registrar las limitaciones exactas cuando un tipo documental no admita ese valor.
8. Cubrir **todos los tipos de comprobante aplicables en Odoo 19 + DGII**, diferenciando claramente:
   - soportados
   - soportados con restricciones
   - no soportados por normativa
   - no soportados por el sandbox
9. Separar estrictamente ambiente local, test/certificación y producción.
10. Proteger credenciales, secretos, certificados y datos sensibles.
11. Crear pruebas automáticas unitarias, de integración y E2E.
12. Dejar observabilidad, logging estructurado y evidencia técnica persistente.
13. Producir memoria técnica de largo plazo y checklist final firmado por evidencia.

---

## Regla troncal de ingeniería

Toda decisión debe seguir estos principios obligatorios:

- estabilidad primero
- reproducibilidad primero
- seguridad primero
- observabilidad primero
- idempotencia donde aplique
- rollback claro
- separación estricta de ambientes
- validación antes de envío
- trazabilidad de extremo a extremo
- errores explícitos, no silenciosos
- evidencia antes que afirmaciones
- API oficial primero; automatización de navegador solo como respaldo controlado

Queda prohibido:

- asumir que algo “seguro funciona”
- cerrar tareas por inspección visual mínima
- usar logs ambiguos
- ocultar errores DGII
- mezclar credenciales de producción con pruebas
- dejar estados inconsistentes sin registrar
- declarar éxito si no hubo evidencia reproducible
- automatizar por navegador para evadir controles de acceso, MFA, CAPTCHA, rate limits o restricciones del portal
- usar scraping o browser automation para saltarse servicios oficiales cuando exista un Web Service o API oficial disponible

---

# FASE 0 — Auditoría exhaustiva del repo y del stack real

Antes de modificar código, inspecciona el repositorio completo.

## Debes localizar exactamente

- stack real del proyecto
- estructura del repo
- puntos de entrada
- módulos de dominio
- rutas públicas y privadas
- servicios
- capa de datos
- modelos
- migraciones
- middlewares
- jobs / workers / colas
- integraciones externas
- variables de entorno reales
- manejo de secretos
- validaciones
- manejo de errores
- sistema de logs
- autenticación y autorización
- panel administrativo y técnico si existe
- flujo actual relacionado con DGII
- flujo actual relacionado con Odoo 19 Enterprise Accounting
- account.move, account.journal, taxes, sequences, partners, EDI, attachments, mail/thread hooks si participan
- generación de XML / JSON / payload fiscal si existe
- firma digital si existe
- certificados y almacén de certificados si existe
- recepción, consulta o polling de estados DGII si existe
- mecanismos de retry, timeout y fallback si existen
- Docker, compose, scripts de arranque y despliegue si existen

## Debes clasificar el estado actual del sistema

- estable y correcto
- funcional pero frágil
- incompleto
- roto
- acoplado indebidamente
- inseguro
- sin observabilidad
- sin trazabilidad
- sin separación correcta de ambientes

## Entregables obligatorios de esta fase

Genera una auditoría inicial con:

- mapa del repo
- mapa funcional
- mapa de dependencias
- flujo actual detectado
- flujo DGII actual detectado
- flujo Odoo Accounting detectado
- síntomas reproducibles
- causa raíz preliminar
- causas secundarias preliminares
- deuda técnica visible
- riesgos visibles
- vacíos críticos
- archivos exactos implicados
- stack final que usarás para corregir

No empieces a editar sin cerrar esta fase.

---

# FASE 1 — Reglas obligatorias de un desarrollo de software estable

Debes endurecer el proyecto con reglas reales de estabilidad.

## Debes verificar e implementar según corresponda

- tipado consistente
- validación de entrada en frontera
- DTOs o esquemas explícitos
- manejo centralizado de errores
- contratos claros entre capas
- servicios desacoplados
- configuración por ambiente
- no hardcode de secretos
- timeouts configurables
- retries con backoff donde aplique
- idempotencia en procesos de envío
- locks o controles de concurrencia si hay riesgo de doble envío
- logs estructurados
- correlación por requestId / operationId / traceId
- métricas por flujo crítico
- auditoría funcional por evento
- healthchecks
- pruebas automáticas
- documentación operativa
- limpieza de código muerto
- eliminación de dependencias innecesarias
- manejo seguro de fechas, zonas horarias y numeración fiscal
- separación estricta entre lógica de negocio y capa de transporte

## Resultado obligatorio

EasyCounting + Odoo 19 Enterprise Accounting debe quedar con un perfil de software estable, operable y auditable.

---

# FASE 2 — Refactor completo de Odoo 19 Enterprise Accounting para compatibilidad con EasyCounting

Debes auditar y refactorizar a profundidad el módulo de contabilidad necesario para que la integración quede limpia y mantenible.

## Debes inspeccionar y corregir

- modelos contables involucrados
- hooks de creación, validación, publicación y reversión de facturas
- sincronización con EasyCounting
- mapeo de impuestos e ITBIS
- secuencias y tipos de comprobante
- diarios contables
- partners / clientes / proveedores
- notas de crédito y débito
- facturas de consumo, fiscales, gubernamentales, exportación y demás tipos aplicables
- acoplamientos frágiles en overrides o monkey patches
- dependencias implícitas entre módulos enterprise y custom
- account_edi y cualquier extensión que toque emisión electrónica
- validaciones duplicadas o contradictorias
- side effects en write/create/post/action_post/button_draft/reversal
- persistencia de respuestas DGII dentro del documento contable y/o modelos auxiliares

## Resultado obligatorio

El refactor debe dejar:

- código modular
- puntos de extensión claros
- compatibilidad con el ciclo contable de Odoo 19 Enterprise
- compatibilidad operativa con EasyCounting
- compatibilidad con DGII
- eventos auditables por operación
- rollback seguro ante fallas

---

# FASE 3 — Cobertura de todos los tipos de comprobante y pruebas reales con monto 0.001

Quiero pruebas reales y cobertura documental completa.

## Debes identificar el catálogo aplicable real

Debes construir una matriz de cobertura con:

- tipo de comprobante
- código / clasificación interna
- soporte en Odoo 19 Enterprise
- soporte en EasyCounting
- soporte en DGII
- restricciones normativas
- restricciones de sandbox/certificación
- posibilidad de emitir con monto 0.001
- resultado de la prueba real
- evidencia

## Debes intentar pruebas reales con monto 0.001

Debes ejecutar pruebas reales con importe **0.001** para todos los tipos de comprobante aplicables **solo en ambiente TEST / certificación y solo si el flujo normativo/técnico lo permite**.

### Regla de ejecución

Para cada tipo de comprobante aplicable:

1. crear documento real de prueba en Odoo 19
2. preparar payload fiscal
3. validar reglas internas
4. emitir contra el ambiente de TEST/certificación correspondiente
5. registrar respuesta DGII
6. consultar estado posterior
7. registrar aceptación, rechazo o restricción
8. guardar evidencia completa

### Si un tipo no admite 0.001

No fuerces el dato de manera ciega.
Debes:

- identificar la restricción exacta
- registrar si la limitación viene de Odoo, EasyCounting, DGII o sandbox
- ejecutar el caso con el mínimo valor permitido cuando corresponda
- dejar evidencia de por qué 0.001 no aplica a ese tipo

## Resultado obligatorio

Una matriz de resultados completa por tipo documental con evidencia reproducible.

---

# FASE 4 — Auditoría e implementación del flujo DGII

Debes inspeccionar si ya existe integración DGII y en qué estado real está.

## Debes localizar

- autenticación o sesión hacia DGII
- endpoints consumidos
- formato de payload
- transformación de datos internos a formato fiscal
- firma digital
- envío de comprobantes
- consulta de resultado
- manejo de TrackId
- persistencia de estatus
- reintentos
- logs
- errores de negocio y errores técnicos
- separación entre test/certificación/producción

## Si no existe o está incompleto

Debes implementar una arquitectura mínima robusta con capas separadas:

- `domain/`
- `application/`
- `infrastructure/dgii/`
- `infrastructure/odoo/`
- `presentation/`
- `observability/`
- `tests/`

## Flujo DGII obligatorio

1. Preparar datos fuente.
2. Validar integridad y reglas de negocio.
3. Generar payload fiscal.
4. Firmar cuando aplique.
5. Registrar intento local antes del envío.
6. Enviar a DGII.
7. Registrar respuesta inmediata.
8. Extraer y persistir TrackId si existe.
9. Consultar estado posterior cuando corresponda.
10. Persistir estado final o intermedio.
11. Exponer al usuario el historial técnico completo.
12. Permitir reintento controlado si hubo fallo recuperable.

## Debes manejar explícitamente

- payload inválido
- certificado inválido o ausente
- error de autenticación
- timeout
- rechazo por validación fiscal
- respuesta incompleta
- trackId ausente
- divergencia entre estado local y estado remoto
- doble envío
- reenvío accidental
- caída temporal del servicio externo
- inconsistencias entre test y producción

---

# FASE 5 — Certificación automática contra la DGII

Quiero que la certificación quede automatizada.

## Principio obligatorio

Debes priorizar **servicios web y flujos oficiales de DGII**. La DGII publica documentación técnica de e-CF, servicios de recepción y consultas de resultados/TrackId; esos mecanismos son la ruta principal. La automatización por navegador solo es admisible como respaldo operacional controlado cuando una etapa del proceso no tenga API oficial suficiente o exista una gestión manual permitida que deba repetirse. La DGII describe validación en línea, TrackId y servicios web de consulta/recepción en su documentación oficial. citeturn986897search5turn986897search8turn986897search16

## Requisito obligatorio

Si el sistema está en ambiente de certificación/test, debe poder ejecutar el set de pruebas o el flujo técnico requerido con la mínima intervención manual posible.

## Debes construir o corregir

- scripts de preparación de ambiente de certificación
- carga segura de credenciales/certificados
- secuencia automatizada de pruebas DGII
- dataset de prueba controlado
- generador de casos reproducibles
- envío automático de casos
- consulta automática de resultados
- consolidación automática de evidencias
- exportación de reporte técnico por corrida

## Debes dejar separación estricta

- `DGII_ENV=local`
- `DGII_ENV=test`
- `DGII_ENV=cert`
- `DGII_ENV=prod`

Nunca mezcles:

- certificados
- tokens
- endpoints
- secuencias
- numeraciones
- respuestas
- evidencias

---

# FASE 6 — Automatización por navegador / scraping controlado para DGII

Este punto debe implementarse con límites estrictos.

## Objetivo permitido

Implementar un **módulo de automatización por navegador** usando **Playwright o Selenium** únicamente para:

- flujos manuales repetitivos del entorno TEST/certificación que estén permitidos por la organización
- obtención de evidencia visual de corridas
- navegación asistida en paneles o formularios donde no exista API oficial suficiente
- verificación operativa secundaria frente a datos ya emitidos por medios oficiales

## Prohibiciones absolutas

Queda prohibido diseñar o ejecutar automatización para:

- evadir CAPTCHA
- evadir MFA/2FA
- burlar controles anti-bot
- sortear rate limits
- escalar privilegios
- acceder a áreas no autorizadas
- saltar validaciones del portal
- usar scraping como reemplazo de un Web Service oficial ya disponible
- automatizar producción sin autorización explícita y controles de seguridad

## Regla sobre “certificación forzada”

Interpreta “forzada” **únicamente** como:

- máxima automatización permitida del flujo de certificación
- ejecución continua y reproducible del set de pruebas
- recolección automática de evidencias
- cierre automático del ciclo técnico cuando el portal o servicio lo permita

No interpretes “forzada” como evasión de controles, bypass o manipulación indebida del portal.

## Arquitectura obligatoria del módulo browser automation

Debes construirlo como módulo aislado:

- `automation/browser/`
- `automation/browser/drivers/`
- `automation/browser/workflows/`
- `automation/browser/selectors/`
- `automation/browser/evidence/`
- `automation/browser/tests/`

## Debes soportar como mínimo

- login controlado solo si el flujo está autorizado y sin evadir MFA/CAPTCHA
- navegación determinística
- detección robusta de errores de UI
- screenshots por paso
- video o trace cuando la herramienta lo permita
- exportación de HTML o DOM relevante cuando aporte evidencia
- captura de tiempos
- registro de correlación con `operationId`
- modo headless y headed
- reintentos controlados ante fallas transitorias de UI
- timeouts explícitos
- selectores resilientes
- almacenamiento de evidencia por corrida

## Estrategia técnica obligatoria

1. **Usa API/Web Service oficial primero.**
2. **Usa Playwright preferentemente** por trazas, videos y mejores utilidades E2E.
3. Usa Selenium solo si el stack o restricciones del entorno lo justifican.
4. Toda automatización de navegador debe estar detrás de un feature flag, por ejemplo:
   - `DGII_BROWSER_AUTOMATION_ENABLED=true`
   - `DGII_BROWSER_AUTOMATION_MODE=assistive|fallback|evidence-only`
5. Nunca hagas que el navegador sea el único origen de verdad para estados fiscales si existe respuesta oficial por servicio web.

## Resultado obligatorio

Debe quedar un módulo de browser automation controlado, auditable y desactivable, útil para TEST/certificación y recolección de evidencia, sin violar controles del portal ni sustituir indebidamente los servicios oficiales.

---

# FASE 7 — Visualización en vivo del proceso en TEST

Este punto es obligatorio.

Cuando el sistema esté ejecutando procesos DGII en ambiente TEST o certificación, debe mostrar el proceso **en vivo**, de forma clara y auditable.

## Debes implementar una consola o panel en vivo con:

- estado actual del proceso
- timestamp por evento
- correlación por operación
- payload preparado
- validaciones ejecutadas
- resultado de cada validación
- solicitud emitida
- respuesta recibida
- TrackId recibido
- consultas posteriores al TrackId
- estado de aceptación o rechazo
- detalles del error
- duración de cada etapa
- duración total
- opción de expandir detalle técnico
- opción de descargar evidencia de la corrida
- eventos del módulo browser automation cuando esté habilitado
- screenshots / trazas asociadas a la corrida en TEST

## Requisitos de implementación

La visualización en vivo debe ser realmente viva, usando una estrategia correcta según el stack:

- WebSocket
- Server-Sent Events
- polling controlado
- cola + canal de notificación
- streaming de logs estructurados

No uses recargas manuales como simulación de “en vivo”.

## Debes exponer por etapas como mínimo

- QUEUED
- VALIDATING
- BUILDING_PAYLOAD
- SIGNING
- SENDING_TO_DGII
- DGII_RESPONSE_RECEIVED
- TRACKID_REGISTERED
- QUERYING_TRACK_STATUS
- ACCEPTED
- ACCEPTED_CONDITIONAL si aplica
- REJECTED
- FAILED_TECHNICAL
- RETRYING
- CANCELLED
- BROWSER_AUTOMATION_STARTED
- BROWSER_AUTOMATION_STEP
- BROWSER_AUTOMATION_EVIDENCE_CAPTURED
- BROWSER_AUTOMATION_FINISHED

## Resultado mínimo obligatorio

Un operador en TEST debe poder ver la corrida completa mientras sucede, sin entrar a logs del servidor.

---

# FASE 8 — Persistencia, trazabilidad y auditoría de eventos

Debes dejar persistencia durable del flujo DGII y del sistema.

## Debes registrar como mínimo

- operationId
- correlationId
- usuario iniciador
- ambiente
- documento interno
- tipo de comprobante
- payload hash
- certificado usado o referencia segura
- fecha/hora de envío
- respuesta inmediata
- TrackId
- estado actual
- historial de transiciones
- errores
- reintentos
- latencias
- evidencia asociada
- si se usó browser automation y en qué modo
- evidencia visual capturada

## Debes crear un historial auditable

Cada operación debe poder reconstruirse sin depender de memoria humana ni de logs efímeros.

---

# FASE 9 — Seguridad y secretos

Debes revisar y endurecer:

- manejo de `.env`
- secretos en CI/CD
- certificados
- archivos sensibles
- permisos
- masking en logs
- redacción de datos sensibles en UI
- protección de rutas administrativas
- protección del panel de monitoreo en vivo
- segregación por rol
- rate limiting si aplica
- CSRF/XSS/SSRF según el stack
- validaciones de archivo y contenido si hay uploads
- credenciales OFV/DGII si existen flujos de navegador autorizados

Queda prohibido:

- imprimir secretos en consola
- dejar certificados en repositorio
- exponer tokens DGII al frontend
- enviar datos fiscales sensibles sin control de acceso
- guardar contraseñas del portal en texto plano
- persistir cookies o sesiones del navegador sin cifrado y políticas de expiración

---

# FASE 10 — Auditoría de dependencias

Debes revisar todas las dependencias del proyecto y clasificarlas en:

- esenciales y bien usadas
- esenciales pero mal usadas
- ausentes pero necesarias
- presentes pero innecesarias
- candidatas a reemplazo
- incompatibles con estabilidad
- incompatibles con seguridad
- incompatibles con integración DGII
- incompatibles con despliegue

Presta especial atención a:

- validación
- auth
- crypto / firma
- XML
- HTTP clients
- retries
- logging
- tracing
- colas
- realtime
- testing
- browser automation
- Playwright / Selenium
- Docker
- observabilidad

No agregues librerías por moda.
Agrega solo lo estrictamente necesario.

---

# FASE 11 — Dockerización y operación reproducible

Debes verificar y corregir:

- Dockerfile
- docker-compose
- `.dockerignore`
- variables por ambiente
- healthchecks
- volúmenes
- certificados montados de forma segura
- compatibilidad del flujo DGII dentro del contenedor
- compatibilidad del browser automation dentro del contenedor cuando se habilite en TEST
- timezone
- relojes del sistema
- persistencia de artefactos
- logs
- monitoreo
- ejecución no-root cuando aplique

## Deben quedar resueltos

- desarrollo local
- test/certificación
- preproducción si aplica
- producción

## Resultado esperado

Debe ser posible levantar el sistema y ejecutar el flujo DGII controlado desde contenedores, incluyendo browser automation en TEST cuando esté habilitado y permitido, o documentar exactamente qué componente queda fuera del contenedor y por qué.

---

# FASE 12 — Pruebas obligatorias

Debes crear y ejecutar pruebas reales.

## Unitarias

- validación de datos
- transformación de payload
- constructor de XML/JSON fiscal
- parser de respuesta
- máquina de estados del proceso
- estrategia de retry
- redacción de logs
- adaptadores Odoo ↔ EasyCounting
- selectores y workflows de browser automation donde aplique

## Integración

- cliente DGII con mocks o sandbox
- persistencia de operaciones
- transiciones de estado
- correlación de eventos
- API del panel en vivo
- autenticación/roles del panel técnico
- integración Odoo 19 ↔ EasyCounting
- módulo browser automation en modo test controlado

## E2E

1. iniciar proceso DGII en TEST
2. ver progreso en vivo
3. recibir respuesta
4. persistir TrackId
5. consultar estado posterior
6. ver resultado final en pantalla
7. reabrir la vista y recuperar historial
8. descargar evidencia
9. ejecutar reintento controlado si aplica
10. validar que producción y test estén separados
11. si browser automation está habilitado, validar que genere evidencia y no rompa el flujo oficial
12. ejecutar pruebas por tipo de comprobante con intento de monto 0.001 donde aplique

## Evidencias obligatorias

Guardar artefactos por ejecución en:

`tests/artifacts/YYYY-MM-DD_HH-mm-ss/`

Incluir:

- screenshots
- videos o traces si aplica
- logs relevantes
- reporte markdown o json
- estado pass/fail
- operationId probado
- ambiente usado
- tipo de comprobante
- monto probado
- si usó API oficial, browser automation o ambos
- evidencias asociadas

---

# FASE 13 — Investigación técnica y decisiones con fuente

Antes de cerrar diseño o implementación, consulta documentación oficial y actualizada sobre:

- DGII e-CF
- proceso de certificación
- endpoints y estados aplicables
- TrackId y consulta de resultados
- firma y validaciones si aplican
- Odoo 19 Enterprise Accounting real del repo
- mecanismo realtime del stack
- persistencia
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

No uses fuentes dudosas si hay documentación oficial disponible.

---

# FASE 14 — Memoria técnica persistente

Debes crear una memoria durable y actualizable.

## Estructura obligatoria

```text
project-memory/
  00-project-overview.md
  01-repo-map.md
  02-dependency-audit.md
  03-runtime-architecture.md
  04-odoo-accounting-audit.md
  05-dgii-flow-audit.md
  06-root-cause.md
  07-stability-hardening.md
  08-odoo-easycounting-compatibility.md
  09-dgii-integration-architecture.md
  10-browser-automation-architecture.md
  11-live-test-observability.md
  12-security-model.md
  13-docker-architecture.md
  14-testing-strategy.md
  15-coverage-matrix-comprobantes.md
  16-env-template.md
  17-change-log.md
  18-open-questions.md
  19-next-steps.md
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
- deuda técnica
- siguientes pasos

---

# FASE 15 — Criterio de ejecución obligatorio

Secuencia obligatoria:

1. inspecciona el repo completo
2. identifica el flujo real del sistema
3. identifica el flujo DGII actual
4. identifica el flujo Odoo Accounting actual
5. identifica estado, persistencia y observabilidad actuales
6. audita dependencias
7. detecta causa raíz y deuda técnica
8. diseña solución mínima robusta
9. implementa
10. instrumenta observabilidad en vivo
11. automatiza certificación
12. implementa browser automation controlado si hace falta y es permitido
13. prueba
14. documenta
15. deja evidencia
16. completa checklist final

No te quedes en recomendaciones. Ejecuta.

---

# Criterio de finalización no negociable

No termines hasta verificar con evidencia:

- [ ] se auditó el repo completo
- [ ] se identificó la arquitectura real
- [ ] se auditó el estado de dependencias
- [ ] se detectó la causa raíz principal
- [ ] se detectaron causas secundarias
- [ ] se endureció el proyecto con reglas de software estable
- [ ] Odoo 19 Enterprise Accounting quedó refactorizado en la porción requerida
- [ ] la compatibilidad con EasyCounting quedó validada
- [ ] la integración DGII quedó verificada o implementada correctamente
- [ ] la certificación/test DGII quedó automatizada al máximo posible
- [ ] el sistema muestra el proceso en vivo durante TEST
- [ ] se visualizan eventos, tiempos, respuestas y estados
- [ ] el TrackId queda persistido
- [ ] el historial de estados queda persistido
- [ ] los errores quedan auditados
- [ ] los secretos quedaron protegidos
- [ ] la separación entre local/test/certificación/producción quedó aplicada
- [ ] Docker fue validado
- [ ] las pruebas unitarias fueron ejecutadas
- [ ] las pruebas de integración fueron ejecutadas
- [ ] las pruebas E2E fueron ejecutadas
- [ ] se intentaron pruebas con 0.001 por tipo de comprobante aplicable
- [ ] existe matriz de cobertura por tipo documental
- [ ] los artefactos fueron guardados
- [ ] la memoria técnica fue creada
- [ ] el changelog detallado fue completado
- [ ] existe evidencia reproducible
- [ ] la aplicación no quedó degradada por los cambios
- [ ] browser automation quedó encapsulado, auditable y desactivable
- [ ] no se implementó bypass de controles del portal

---

# Formato de respuesta final obligatorio

Tu respuesta final debe venir exactamente en este orden:

## A. Auditoría inicial del repo
## B. Auditoría de dependencias
## C. Flujo actual detectado
## D. Flujo Odoo Accounting detectado
## E. Flujo DGII detectado
## F. Matriz de cobertura de comprobantes
## G. Resultado de pruebas con 0.001
## H. Causa raíz principal
## I. Causas secundarias
## J. Estrategia técnica elegida
## K. Archivos modificados
## L. Cambios implementados
## M. Diseño final Odoo 19 ↔ EasyCounting
## N. Diseño final de integración DGII
## O. Diseño final de certificación automática
## P. Diseño final de browser automation controlado
## Q. Diseño final de monitoreo en vivo en TEST
## R. Reglas de estabilidad aplicadas
## S. Seguridad aplicada
## T. Refactorización Docker realizada
## U. Pruebas ejecutadas
## V. Evidencias generadas
## W. Memoria técnica creada
## X. Riesgos pendientes
## Y. Checklist final completo
## Z. Cómo reproducir local, test/certificación y producción

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
- probar
- registrar
- evidenciar
- cerrar con resultados concretos

---

# Inicio obligatorio

Empieza ya y trabaja en este orden exacto:

1. inspecciona el repo completo
2. identifica el flujo funcional real
3. identifica el flujo Odoo Accounting real
4. identifica el flujo DGII real
5. identifica estado, persistencia y observabilidad actuales
6. audita dependencias
7. inspecciona Docker y configuración por ambiente
8. entrega auditoría
9. implementa
10. habilita visualización en vivo en TEST
11. automatiza certificación
12. implementa browser automation controlado si la fase lo requiere y es permitido
13. ejecuta pruebas
14. documenta
15. completa checklist final
