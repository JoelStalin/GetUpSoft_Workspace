# Prompt Maestro Unificado + Plan de Implementación para Integración de Firma Digital e-CF DGII

**Versión:** 1.0  
**Objetivo:** Este documento está diseñado para ser usado por agentes de desarrollo como **Codex, Claude, Cursor** o asistentes equivalentes para ejecutar, de forma disciplinada y auditable, la implementación completa de firma digital, validación, envío, consulta, pruebas automáticas y preparación para certificación de **Comprobantes Fiscales Electrónicos (e-CF)** de la **DGII de República Dominicana**.  
**Idioma operativo:** Español  
**Nivel de precisión requerido:** Milimétrico, ejecutable, sin recomendaciones vagas.

---

## 1. Cómo usar este documento

Este archivo tiene dos funciones simultáneas:

1. **Prompt maestro unificado** para entregar a un agente de código.
2. **Plan de implementación y workflow operativo** para obligar al agente a trabajar por fases, con entregables verificables, pruebas y criterios de aceptación.

### Modo de uso recomendado

- **Codex / Cursor / Claude Code / Agente IDE**: pegar el contenido completo o usarlo como archivo base del repositorio.
- **Ejecución por fases**: pedir al agente que ejecute estrictamente una fase a la vez y produzca evidencia antes de continuar.
- **Regla de control**: no aceptar respuestas narrativas sin archivos, sin diff conceptual, sin tests y sin checklist.

### Regla operativa principal

El agente **no debe limitarse a describir**. Debe:

- inspeccionar el repositorio,
- detectar el stack real,
- seleccionar dependencias compatibles,
- diseñar la arquitectura,
- producir código real,
- producir pruebas,
- producir configuración,
- producir documentación,
- producir checklist de despliegue y certificación.

---

## 2. Resultado esperado al finalizar

Al terminar la ejecución, el agente debe haber entregado:

- diagnóstico del repositorio;
- arquitectura propuesta;
- matriz de credenciales y secretos;
- dependencias y justificación técnica;
- archivos a crear o modificar;
- implementación del flujo de firma digital;
- validación XSD;
- autenticación DGII por semilla;
- envío de e-CF firmado;
- persistencia de `TrackId`;
- consulta de estado;
- código de seguridad y QR si aplican;
- logs estructurados y redacción de secretos;
- pruebas unitarias;
- pruebas de integración;
- pruebas funcionales;
- pruebas negativas y de resiliencia;
- plan de certificación;
- checklist operativo paso a paso;
- runbook de incidentes;
- documentación en `docs/`.

---

## 3. Reglas innegociables para el agente

El agente debe respetar estas reglas sin excepción:

1. No inventar archivos del repositorio sin inspección previa.
2. No implementar criptografía desde cero.
3. No firmar en frontend.
4. No exponer secretos reales.
5. No omitir validación local de firma.
6. No omitir validación XSD previa al firmado.
7. No omitir persistencia de `TrackId`.
8. No omitir manejo de `En Proceso`.
9. No omitir idempotencia y reintentos seguros.
10. No omitir pruebas funcionales.
11. No omitir separación por ambientes: test, certificación, producción.
12. No modificar el XML después de firmado.
13. No usar pretty-print del XML firmado.
14. No omitir documentación de errores.
15. No omitir criterios de aceptación por fase.
16. No cambiar el estilo del proyecto si ya existe una convención clara.
17. No agregar dependencias sin revisar compatibilidad con el stack y lockfiles.
18. No responder con pseudocódigo cuando se pida implementación.
19. No continuar a la siguiente fase sin dejar evidencia verificable de la fase actual.
20. No ejecutar envíos reales a producción salvo que el usuario lo solicite explícitamente y el entorno esté preparado.

---

## 4. Workflow limpio y detallado de ejecución para agentes

El agente debe ejecutar el trabajo siguiendo este workflow exacto.

### Fase 0 — Preflight y control de ejecución

**Objetivo:** definir el marco de trabajo antes de tocar código.

**Tareas obligatorias:**

- inspeccionar árbol del repositorio;
- detectar lenguaje, framework, package manager, runtime, lockfiles;
- detectar módulos de facturación, XML, certificados, HTTP, jobs, testing;
- detectar configuración por ambientes;
- detectar herramientas CI/CD;
- detectar cómo se persisten documentos, estados y logs;
- detectar deudas técnicas que afecten firma, validación o certificación.

**Entregables obligatorios:**

- diagnóstico del repo;
- lista de archivos relevantes;
- lista de archivos a crear/modificar;
- riesgos iniciales;
- supuestos explícitos.

**Criterio de aceptación de la fase:**

- el agente puede explicar con precisión dónde debe vivir cada componente clave;
- el stack real está identificado;
- el plan de implementación está adaptado al repo real.

---

### Fase 1 — Diseño técnico y selección de herramientas

**Objetivo:** fijar arquitectura, dependencias y estrategia de integración.

**Tareas obligatorias:**

- elegir librerías maduras por stack;
- justificar cada dependencia;
- evaluar compatibilidad con versiones reales del repo;
- diseñar los servicios de firma, verificación, autenticación DGII, recepción, consulta y persistencia;
- diseñar la gestión de secretos;
- definir estructura de archivos y módulos.

**Entregables obligatorios:**

- arquitectura propuesta;
- diagrama textual;
- matriz de dependencias;
- diff conceptual de archivos;
- estrategia de configuración y secretos.

**Criterio de aceptación de la fase:**

- cada dependencia tiene motivo técnico claro;
- existe una separación explícita entre XML, firma, autenticación, envío y consulta;
- la arquitectura evita mutaciones del XML firmado.

---

### Fase 2 — Configuración, credenciales y seguridad

**Objetivo:** preparar la base operativa segura.

**Tareas obligatorias:**

- crear `.env.example` o equivalente;
- crear esquema de configuración con validación fail-fast;
- definir matriz de secretos y credenciales;
- definir política de logs y masking;
- definir política de expiración de certificado;
- impedir uso accidental de endpoints o certificados incorrectos por ambiente.

**Entregables obligatorios:**

- archivo de configuración de ejemplo;
- validaciones de arranque;
- matriz de credenciales;
- reglas de masking;
- validaciones de certificado.

**Criterio de aceptación de la fase:**

- la app falla al arrancar si faltan secretos críticos;
- la configuración está segregada por ambiente;
- secretos sensibles no aparecen en logs.

---

### Fase 3 — Construcción del XML y validación XSD

**Objetivo:** producir XML tributario correcto antes de firmar.

**Tareas obligatorias:**

- construir XML base del tipo de e-CF correspondiente;
- validar contra XSD;
- bloquear firmado si el XML no cumple esquema;
- preservar orden, namespaces, encoding y formato requeridos.

**Entregables obligatorios:**

- `XmlBuilderService` o equivalente;
- `XsdValidatorService` o equivalente;
- fixtures XML válidos e inválidos;
- pruebas unitarias de construcción y validación.

**Criterio de aceptación de la fase:**

- un XML válido pasa;
- un XML inválido falla antes del firmado;
- existen tests reproducibles.

---

### Fase 4 — Carga de certificado y firmado XMLDSIG

**Objetivo:** firmar correctamente el documento con RSA-SHA256 y X509Data.

**Tareas obligatorias:**

- cargar `.p12` / `.pfx`;
- validar password;
- extraer clave privada y certificado;
- validar expiración, subject, serial y RNC esperado;
- firmar XML con XMLDSIG;
- incluir `KeyInfo/X509Data`;
- verificar localmente la firma;
- calcular fingerprint del XML firmado;
- bloquear mutaciones posteriores.

**Entregables obligatorios:**

- `CertificateProvider`;
- `XmlSignatureService`;
- `XmlSignatureVerificationService`;
- tests unitarios y negativos;
- fixtures con XML alterado.

**Criterio de aceptación de la fase:**

- XML válido → firma exitosa;
- XML firmado → verificación local exitosa;
- XML firmado modificado → verificación falla;
- certificado vencido → firmado bloqueado.

---

### Fase 5 — Autenticación DGII

**Objetivo:** integrar el flujo semilla → semilla firmada → token.

**Tareas obligatorias:**

- obtener semilla;
- firmar semilla;
- validar semilla;
- obtener token;
- cachear token;
- renovar token de forma segura;
- manejar timeouts y errores HTTP.

**Entregables obligatorios:**

- `DgiiAuthenticationService`;
- cliente HTTP para autenticación;
- tests de integración con mocks;
- estrategia de token cache.

**Criterio de aceptación de la fase:**

- la autenticación puede simularse en tests;
- el token se renueva sin filtrar secretos;
- errores de autenticación quedan tipados y logueados.

---

### Fase 6 — Envío, TrackId y consulta de estado

**Objetivo:** completar el flujo operativo hacia DGII.

**Tareas obligatorias:**

- enviar e-CF firmado;
- persistir request, response y `TrackId`;
- consultar estado por `TrackId`;
- manejar `Aceptado`, `Rechazado`, `Aceptado Condicional`, `En Proceso`;
- implementar polling seguro;
- impedir duplicados por reintento o timeout.

**Entregables obligatorios:**

- `DgiiRecepcionService`;
- `DgiiConsultaService`;
- repositorio de submissions;
- estrategia de idempotencia;
- pruebas de integración y funcionales.

**Criterio de aceptación de la fase:**

- envío exitoso persiste `TrackId`;
- consulta retorna estados y actualiza persistencia;
- timeout no duplica comprobantes.

---

### Fase 7 — Código de seguridad, QR y representación impresa

**Objetivo:** completar artefactos operativos posteriores al envío.

**Tareas obligatorias:**

- derivar código de seguridad;
- construir payload QR;
- generar representación impresa si el proyecto lo requiere;
- vincular representación con estado, eNCF y trazabilidad.

**Entregables obligatorios:**

- `SecurityCodeService`;
- `QrPayloadService`;
- módulo de representación impresa si aplica;
- pruebas funcionales de estos componentes.

**Criterio de aceptación de la fase:**

- código de seguridad reproducible;
- QR consistente con la data persistida;
- documento impreso trazable al e-CF.

---

### Fase 8 — Observabilidad, runbook y endurecimiento

**Objetivo:** asegurar operación estable y auditable.

**Tareas obligatorias:**

- logs estructurados;
- redacción de secretos;
- correlación entre `invoiceId`, `eNCF`, `TrackId`, `requestId`;
- alertas por expiración de certificado;
- alertas por `En Proceso` prolongado;
- alertas por rechazo repetido;
- runbook de incidentes.

**Entregables obligatorios:**

- configuración de logging;
- estrategia de correlación;
- documentación operativa;
- pruebas de masking de secretos.

**Criterio de aceptación de la fase:**

- eventos críticos dejan trazabilidad utilizable;
- secretos no aparecen en observabilidad;
- existe guía de respuesta operativa.

---

### Fase 9 — Pruebas automáticas, funcionales y certificación

**Objetivo:** dejar el sistema listo para validación formal y evolución segura.

**Tareas obligatorias:**

- crear unit tests;
- crear integration tests;
- crear functional tests;
- crear negative tests;
- crear resiliency tests;
- crear idempotency tests;
- crear certificate rotation tests;
- preparar matriz de certificación DGII;
- preparar carpeta de evidencias.

**Entregables obligatorios:**

- suite automática ejecutable;
- matriz funcional;
- plan de certificación;
- documentos en `docs/certificacion-dgii/`.

**Criterio de aceptación de la fase:**

- pruebas clave reproducibles en local y CI;
- la certificación tiene trazabilidad y evidencia;
- existe checklist de salida a producción.

---

## 5. Instrucciones especiales según el agente

### Si el agente es Codex

Debe trabajar orientado a:

- lectura real del repo;
- edición de archivos concretos;
- propuestas tipo PR;
- tests reproducibles;
- diffs claros.

**Orden recomendado:**
1. diagnóstico;
2. diff conceptual;
3. configuración;
4. servicios;
5. tests;
6. docs.

### Si el agente es Claude

Debe usarse para:

- arquitectura;
- matrices de error;
- diseño de pruebas;
- documentación técnica;
- revisión crítica de gaps.

**Orden recomendado:**
1. arquitectura;
2. casos de uso;
3. riesgos;
4. checklist;
5. runbook;
6. mejora de calidad de documentos.

### Si el agente es Cursor

Debe aprovecharse para:

- implementación incremental;
- navegación del repo;
- edición de módulos;
- ejecución local de tests;
- refactor limpio.

**Orden recomendado:**
1. seleccionar archivos;
2. implementar módulo por módulo;
3. correr tests por fase;
4. corregir;
5. documentar.

### Uso combinado recomendado

**Claude** para arquitectura y prompt refinado.  
**Codex / Cursor** para implementación, tests y refactor.  
**Claude** nuevamente para auditoría final de gaps, riesgos y checklist de certificación.

---

## 6. Prompt maestro unificado para ejecutar en el agente

> Pega esta sección en el agente si quieres forzar una ejecución disciplinada.  
> Se recomienda mantenerla completa.

---

# PROMPT MAESTRO

Actúa como un **principal engineer**, **arquitecto de integración tributaria**, especialista en **XMLDSIG**, **criptografía aplicada**, **DGII República Dominicana**, **backend seguro**, **pruebas automáticas** y **certificación de e-CF**.

Tu trabajo no es dar consejos generales. Tu trabajo es **inspeccionar mi repositorio y producir una propuesta de implementación real o implementación real**, con archivos, estructura, configuración, pruebas y documentación, como si fueras a abrir un PR listo para revisión técnica.

## OBJETIVO PRINCIPAL

Debes construir la integración completa de:

- generación del XML de e-CF,
- validación contra XSD,
- carga segura del certificado `.p12/.pfx`,
- firma digital XMLDSIG con RSA-SHA256,
- verificación local de firma,
- autenticación DGII por semilla,
- envío de e-CF firmado,
- persistencia de `TrackId`,
- consulta de estado,
- manejo de `En Proceso`,
- idempotencia, reintentos y trazabilidad,
- código de seguridad y QR si aplican,
- pruebas automáticas,
- pruebas funcionales,
- preparación para certificación.

## REGLAS INNEGOCIABLES

1. Inspecciona el repositorio antes de proponer archivos.
2. Detecta el stack real: lenguaje, framework, runtime, package manager y lockfiles.
3. Adapta toda la solución al stack real.
4. No implementes criptografía desde cero.
5. No firmes en frontend.
6. No pongas secretos reales.
7. No omitas validación XSD.
8. No omitas validación local de firma.
9. No omitas persistencia de `TrackId`.
10. No omitas manejo de `En Proceso`.
11. No omitas pruebas funcionales.
12. No omitas documentación de errores.
13. No modifiques el XML después de firmado.
14. No uses pretty-print después de la firma.
15. No agregues dependencias sin revisar compatibilidad real con el repo.
16. No respondas con pseudocódigo si se piden implementaciones.
17. Trabaja por fases y deja evidencia antes de pasar a la siguiente.

## CONTEXTO TÉCNICO OBLIGATORIO

Debes tratar esta integración como una integración de **e-CF de la DGII de República Dominicana**.

Debes respetar estas premisas:

- XML tributario válido según XSD del tipo de e-CF.
- Firma XMLDSIG.
- Firma envuelta cuando corresponda al documento completo.
- RSA-SHA256.
- Digest SHA-256.
- Canonización XML correcta.
- Inclusión de `KeyInfo/X509Data`.
- Manejo correcto de `Reference URI`, incluyendo el caso `URI=""` cuando aplique.
- El XML firmado no debe alterarse.
- El firmado debe ser el último paso antes del envío.
- Debe existir autenticación con semilla firmada para obtener token.
- El envío debe devolver `TrackId` y debe persistirse.
- La consulta posterior debe actualizar el estado del documento.
- Debe contemplarse `Aceptado`, `Rechazado`, `Aceptado Condicional` y `En Proceso`.
- Debe existir protección contra duplicidad.

## CREDENCIALES Y SECRETOS QUE DEBES MODELAR

Debes producir una matriz de credenciales y secretos con:

- nombre lógico,
- descripción,
- obligatorio/opcional,
- ambiente,
- formato,
- ejemplo enmascarado,
- dónde se usa,
- cómo se valida,
- riesgo de seguridad.

Como mínimo contempla:

### Identidad tributaria
- `DGII_RNC`
- `DGII_RAZON_SOCIAL`
- `DGII_USUARIO_ADMINISTRADOR_ID`
- `DGII_USUARIO_ADMINISTRADOR_NOMBRE`
- `DGII_ENV`

### Certificado
- `DGII_CERT_P12_PATH` o `DGII_CERT_P12_BASE64`
- `DGII_CERT_PASSWORD`
- `DGII_CERT_ALIAS` si aplica
- `DGII_CERT_EXPECTED_SUBJECT`
- `DGII_CERT_EXPECTED_SERIAL`
- `DGII_CERT_EXPECTED_RNC`
- `DGII_CERT_EXPIRATION_ALERT_DAYS`

### Endpoints y operación
- `DGII_AUTH_BASE_URL`
- `DGII_RECEPCION_BASE_URL`
- `DGII_CONSULTA_BASE_URL`
- `DGII_RECEPCION_TIMEOUT_MS`
- `DGII_CONSULTA_TIMEOUT_MS`
- `DGII_MAX_RETRIES`
- `DGII_RETRY_BACKOFF_MS`
- `DGII_POLL_INTERVAL_SECONDS`
- `DGII_IDEMPOTENCY_WINDOW_MINUTES`

### Seguridad
- `SECRET_PROVIDER`
- `LOG_REDACT_SECRETS`
- `ALLOW_XML_PRETTY_PRINT_AFTER_SIGN=false`
- `DGII_STORE_RAW_XML`
- `DGII_STORE_SIGNED_XML`
- `DGII_STORE_DGII_RESPONSES`

## LO QUE DEBES INSPECCIONAR DEL REPOSITORIO

Quiero que inspecciones y reportes:

- árbol de carpetas relevante;
- framework y versión;
- runtime y versión;
- package manager;
- archivos de configuración;
- servicios existentes;
- módulos de facturación;
- generación actual de XML;
- validación XSD si existe;
- clientes HTTP/SOAP/REST;
- manejo actual de certificados;
- manejo de secretos;
- jobs, colas o scheduler;
- persistencia de documentos y estados;
- logging y observabilidad;
- pruebas actuales;
- CI/CD.

Debes entregar:

1. archivos relevantes encontrados;
2. archivos que vas a tocar;
3. archivos nuevos a crear;
4. deuda técnica;
5. riesgos técnicos.

## ARQUITECTURA OBLIGATORIA

Debes diseñar y adaptar al stack real una arquitectura con separación explícita entre:

- `InvoiceDomainService`
- `XmlBuilderService`
- `XsdValidatorService`
- `CertificateProvider`
- `XmlSignatureService`
- `XmlSignatureVerificationService`
- `SecurityCodeService`
- `QrPayloadService`
- `DgiiAuthenticationService`
- `DgiiRecepcionService`
- `DgiiConsultaService`
- `DgiiCommercialApprovalService` si aplica
- `SignedXmlRepository`
- `DgiiSubmissionRepository`
- `CertificateMonitoringService`
- `FunctionalTestHarness`

Incluye un diagrama textual de dependencias y flujo.

## ENTREGA EN ESTE ORDEN EXACTO

Tu respuesta debe tener estas secciones:

1. Resumen ejecutivo  
2. Diagnóstico del repositorio  
3. Arquitectura propuesta  
4. Flujo end-to-end  
5. Matriz de credenciales y secretos  
6. Dependencias y herramientas  
7. Diseño de archivos  
8. Implementación detallada  
9. Ejemplos de código  
10. Casos de uso  
11. Casos de error  
12. Pruebas automáticas  
13. Pruebas funcionales  
14. Checklist paso a paso  
15. Riesgos residuales y siguientes pasos

## SELECCIÓN DE HERRAMIENTAS POR STACK

### Si el stack es Node.js / TypeScript

- prioriza librerías de firma y manejo PKCS#12 compatibles con el repo;
- si el proyecto es NestJS, usa modules/providers/injection;
- si es Express/Fastify, usa services/controllers/middlewares;
- usa framework de pruebas existente o Jest;
- crea fixtures XML y mocks HTTP.

### Si el stack es .NET

- prioriza `SignedXml` y `System.Security.Cryptography.Xml`;
- adapta a `IOptions`, `appsettings`, DI y framework de pruebas existente;
- valida compatibilidad real con el target framework.

### Si el stack es Python

- prioriza `signxml`, `lxml`, `cryptography`;
- usa `pytest` y fixtures;
- separa firma, verificación, auth y envío.

### Si el stack es PHP

- usa una librería XMLDSIG mantenible y compatible;
- controla whitespace, DOM y openssl cuidadosamente;
- usa PHPUnit/Pest y fixtures XML.

### Si el stack es Java

- usa JSR 105 y/o Apache Santuario si hace falta;
- usa JUnit y fixtures;
- separa factories, signers, validators y adapters.

## EJEMPLOS DE CÓDIGO OBLIGATORIOS

Necesito implementaciones reales para:

1. carga de certificado `.p12/.pfx`;  
2. extracción de clave privada y certificado;  
3. validación de expiración, serial, subject y RNC esperado;  
4. construcción del XML base;  
5. validación XSD;  
6. firmado XMLDSIG con RSA-SHA256;  
7. inclusión de `KeyInfo/X509Data`;  
8. verificación local;  
9. bloqueo de mutación post-firma;  
10. obtención de semilla DGII;  
11. firma de semilla;  
12. obtención y cacheo de token;  
13. envío de e-CF firmado;  
14. persistencia de `TrackId`;  
15. consulta de estado;  
16. polling seguro de `En Proceso`;  
17. generación de código de seguridad;  
18. generación de QR;  
19. logs estructurados;  
20. redacción de secretos;  
21. idempotencia;  
22. reintentos con backoff;  
23. persistencia request/response;  
24. rotación de certificado;  
25. validación de configuración al arranque;  
26. test unitario de firmado;  
27. test funcional end-to-end.

## CASOS DE ERROR OBLIGATORIOS

Debes listar, detectar y resolver técnicamente estos grupos de error:

### Certificado
- archivo inexistente;
- password incorrecta;
- certificado expirado;
- certificado aún no vigente;
- ausencia de clave privada;
- subject inesperado;
- serial inesperado;
- RNC inconsistente;
- certificado corrupto;
- certificado del ambiente equivocado.

### XML
- XML mal formado;
- encoding inválido;
- namespaces incorrectos;
- orden inválido de nodos;
- datos requeridos ausentes;
- fechas inválidas;
- montos inconsistentes;
- XSD inválido;
- `DigestMethod` incorrecto;
- `SignatureMethod` incorrecto;
- `Reference URI` incorrecto;
- `KeyInfo/X509Data` ausente;
- whitespace alterado;
- pretty-print post firma;
- mutación posterior a la firma;
- firma local inválida.

### DGII
- fallo al obtener semilla;
- fallo al validar semilla;
- token nulo o expirado;
- timeout en auth;
- timeout en recepción;
- timeout en consulta;
- 401/403/500/502/503;
- `TrackId` nulo;
- `En Proceso` prolongado;
- rechazo;
- respuesta inesperada;
- duplicidad de envío.

### Operación
- XML firmado no persistido;
- `TrackId` no persistido;
- idempotencia rota;
- polling duplicado;
- race conditions;
- secretos en logs;
- dependencia incompatible;
- certificado renovado no desplegado;
- endpoint equivocado por ambiente.

Para cada error entrega:

- nombre corto;
- descripción;
- causa raíz probable;
- síntoma observable;
- cómo detectarlo;
- log recomendado;
- respuesta técnica;
- respuesta operativa;
- test asociado.

## PRUEBAS AUTOMÁTICAS OBLIGATORIAS

Debes diseñar una suite con:

- unit tests;
- integration tests;
- functional tests;
- negative tests;
- resiliency tests;
- idempotency tests;
- certificate rotation tests;
- regression tests.

## MATRIZ DE PRUEBAS FUNCIONALES OBLIGATORIAS

Incluye al menos estos escenarios:

- F001 XML válido sin firmar → firmado exitoso
- F002 XML firmado → verificación local exitosa
- F003 XML firmado alterado en 1 carácter → verificación falla
- F004 XML firmado con whitespace alterado → documentar comportamiento real
- F005 certificado válido → firmado permitido
- F006 certificado expirado → firmado bloqueado
- F007 password incorrecta → error controlado
- F008 XML fuera de XSD → bloqueo antes de firmar
- F009 semilla obtenida → firma de semilla exitosa
- F010 token obtenido → envío permitido
- F011 envío exitoso → `TrackId` persistido
- F012 consulta → estado `Aceptado`
- F013 consulta → estado `Rechazado`
- F014 consulta → estado `Aceptado Condicional`
- F015 consulta → estado `En Proceso` y reconsulta
- F016 timeout en recepción → reintento seguro
- F017 error 500 DGII → backoff y retry
- F018 reintento no duplica documento
- F019 XML ya firmado → no se re-firma accidentalmente
- F020 código de seguridad correcto
- F021 QR correcto
- F022 rotación de certificado exitosa
- F023 certificado de ambiente incorrecto → bloqueo
- F024 logs con secretos redactados
- F025 persistencia completa request/response/TrackId
- F026 representación impresa correcta
- F027 separación correcta entre test/cert/prod
- F028 polling sin carreras ni duplicados
- F029 recuperación de documentos pendientes tras reinicio
- F030 regresión completa del flujo

Para cada prueba define:

- ID,
- nombre,
- objetivo,
- precondiciones,
- datos,
- pasos,
- resultado esperado,
- logs esperados,
- persistencia esperada,
- criterio de aceptación.

## CHECKLIST OPERATIVO PASO A PASO

Debes producir un checklist detallado y secuencial que cubra al menos:

1. confirmar requisitos DGII del contribuyente;  
2. confirmar usuario administrador;  
3. confirmar acceso OFV y portal;  
4. obtener certificado;  
5. validar metadata del certificado;  
6. asegurar cadena de confianza;  
7. preparar secretos;  
8. crear `.env.example`;  
9. crear config schema;  
10. detectar stack real;  
11. ubicar módulo XML;  
12. ubicar módulo de facturación;  
13. construir XML base;  
14. validar XSD;  
15. integrar carga del certificado;  
16. integrar firmado RSA-SHA256;  
17. integrar `KeyInfo/X509Data`;  
18. integrar verificación local;  
19. integrar fingerprint anti-mutation;  
20. integrar semilla DGII;  
21. integrar token;  
22. integrar recepción;  
23. persistir `TrackId`;  
24. integrar consulta;  
25. integrar polling;  
26. integrar manejo de estados;  
27. integrar logs y masking;  
28. integrar idempotencia;  
29. integrar retries;  
30. integrar código de seguridad;  
31. integrar QR;  
32. integrar representación impresa;  
33. crear tests unitarios;  
34. crear tests de integración;  
35. crear tests funcionales;  
36. correr suite local;  
37. correr suite CI;  
38. preparar certificación;  
39. ejecutar simulación;  
40. registrar evidencias;  
41. corregir rechazos;  
42. congelar configuración de producción;  
43. desplegar por ambiente;  
44. monitorear expiración del certificado;  
45. monitorear rechazos y `En Proceso`;  
46. preparar runbook de incidentes.

## FORMATO DE ENTREGA DE CÓDIGO

Cada archivo que propongas o implementes debe incluir:

- ruta sugerida o real;
- propósito;
- imports;
- implementación;
- validaciones;
- errores tipados;
- logs estructurados;
- ejemplo de uso;
- test asociado.

## SALIDA FINAL ESPERADA

Tu trabajo estará completo solo si entregas:

1. resumen ejecutivo;  
2. diagnóstico del repo;  
3. arquitectura;  
4. dependencias;  
5. configuración;  
6. archivos;  
7. código;  
8. pruebas;  
9. checklist;  
10. riesgos;  
11. siguientes pasos.

Empieza ya. Primero inspecciona el repositorio y entrega el diagnóstico. Luego continúa inmediatamente con la propuesta completa.

---

## 7. Plan de implementación operativo para el agente

Esta sección le indica al agente **cómo ejecutar** el prompt maestro de forma ordenada dentro del repositorio.

### Paso 1 — Leer y mapear el proyecto

El agente debe producir una tabla como esta:

| Área | Ruta/archivo | Qué hace hoy | Gap detectado | Acción propuesta |
|---|---|---|---|---|
| Configuración | `...` | `...` | `...` | `...` |
| XML | `...` | `...` | `...` | `...` |
| Facturación | `...` | `...` | `...` | `...` |
| HTTP cliente | `...` | `...` | `...` | `...` |
| Persistencia | `...` | `...` | `...` | `...` |
| Tests | `...` | `...` | `...` | `...` |

### Paso 2 — Emitir diff conceptual antes de codificar

El agente debe listar primero:

- archivos a crear;
- archivos a modificar;
- archivos de test;
- archivos de documentación.

No debe empezar a implementar sin este mapa.

### Paso 3 — Implementar infraestructura mínima primero

Orden recomendado:

1. configuración y secrets;  
2. tipos y errores;  
3. proveedor de certificados;  
4. constructor XML;  
5. validador XSD;  
6. firmador XML;  
7. verificador local;  
8. cliente de autenticación;  
9. cliente de recepción;  
10. cliente de consulta;  
11. persistencia;  
12. observabilidad;  
13. servicios auxiliares;  
14. tests;  
15. docs.

### Paso 4 — Forzar pruebas por fase

El agente debe correr o definir pruebas mínimas por fase.

**Después de Fase 3:** XML + XSD  
**Después de Fase 4:** firma + verificación  
**Después de Fase 5:** auth DGII mockeada  
**Después de Fase 6:** submit + `TrackId` + consulta  
**Después de Fase 7:** QR + código seguridad  
**Después de Fase 9:** suite funcional completa

### Paso 5 — Preparar evidencias

El agente debe proponer una carpeta:

```text
/docs
  /ecf-integration
  /certificacion-dgii
    matriz-casos.md
    incidencias.md
    trackids.csv
    checklist-salida-produccion.md
    /evidencias
```

### Paso 6 — Cierre técnico

Antes de cerrar, el agente debe validar:

- que el XML firmado no se muta;
- que la firma se valida localmente;
- que los secretos no se filtran;
- que el `TrackId` se persiste;
- que existen retries seguros;
- que hay pruebas funcionales reproducibles;
- que la salida a producción está documentada.

---

## 8. Plantilla de matriz de credenciales y secretos

El agente debe llenar una tabla equivalente a esta:

| Nombre | Descripción | Obligatorio | Ambiente | Formato | Ejemplo enmascarado | Dónde se usa | Validación | Riesgo |
|---|---|---:|---|---|---|---|---|---|
| `DGII_RNC` | RNC del emisor | Sí | todos | string | `13******7` | XML, auth, validaciones | no vacío, formato válido | alto |
| `DGII_CERT_P12_PATH` | ruta del certificado | Sí | todos | path | `/run/secrets/***.p12` | carga de certificado | archivo existe | alto |
| `DGII_CERT_PASSWORD` | password PKCS#12 | Sí | todos | string secreto | `***MASKED***` | carga de certificado | no vacío | crítico |
| `DGII_AUTH_BASE_URL` | base URL auth | Sí | por ambiente | URL | `https://...` | auth DGII | URL válida | alto |
| `DGII_POLL_INTERVAL_SECONDS` | intervalo consulta | Sí | todos | int | `30` | polling | > 0 | medio |

---

## 9. Plantilla mínima de `.env.example`

El agente debe producir un equivalente real adaptado al stack:

```env
DGII_ENV=test
DGII_RNC=131234567
DGII_RAZON_SOCIAL=EMPRESA DEMO SRL
DGII_USUARIO_ADMINISTRADOR_ID=USR-ADMIN-01
DGII_USUARIO_ADMINISTRADOR_NOMBRE=USUARIO ADMIN

DGII_CERT_P12_PATH=/run/secrets/dgii_cert.p12
DGII_CERT_PASSWORD=__SET_IN_SECRET_MANAGER__
DGII_CERT_ALIAS=
DGII_CERT_EXPECTED_SUBJECT=CN=EMPRESA DEMO SRL
DGII_CERT_EXPECTED_SERIAL=__OPTIONAL__
DGII_CERT_EXPECTED_RNC=131234567
DGII_CERT_EXPIRATION_ALERT_DAYS=30

DGII_AUTH_BASE_URL=https://ecf.dgii.gov.do/TesteCF/Autenticacion
DGII_RECEPCION_BASE_URL=https://ecf.dgii.gov.do/TesteCF/Recepcion
DGII_CONSULTA_BASE_URL=https://ecf.dgii.gov.do/TesteCF/ConsultaResultado
DGII_RECEPCION_TIMEOUT_MS=30000
DGII_CONSULTA_TIMEOUT_MS=15000
DGII_MAX_RETRIES=3
DGII_RETRY_BACKOFF_MS=1000
DGII_POLL_INTERVAL_SECONDS=30
DGII_IDEMPOTENCY_WINDOW_MINUTES=30

SECRET_PROVIDER=env
LOG_REDACT_SECRETS=true
ALLOW_XML_PRETTY_PRINT_AFTER_SIGN=false
DGII_STORE_RAW_XML=true
DGII_STORE_SIGNED_XML=true
DGII_STORE_DGII_RESPONSES=true
```

---

## 10. Plantilla mínima de diseño de archivos

El agente debe producir algo equivalente, adaptado al stack real:

```text
src/
  config/
    dgii.config.*
    secrets.config.*
  modules/
    ecf/
      application/
        sign-ecf.use-case.*
        submit-ecf.use-case.*
        poll-trackid.use-case.*
      domain/
        xml-builder.service.*
        xsd-validator.service.*
        certificate-provider.service.*
        xml-signature.service.*
        xml-signature-verifier.service.*
        security-code.service.*
        qr-payload.service.*
      infrastructure/
        dgii-auth.client.*
        dgii-recepcion.client.*
        dgii-consulta.client.*
        ecf-submission.repository.*
        signed-xml.repository.*
      tests/
        unit/
        integration/
        functional/
  docs/
    ecf-integration.md
    certificacion-dgii/
```

---

## 11. Guía para exigir pruebas al agente

El agente debe producir pruebas con la siguiente cobertura mínima.

### Pruebas unitarias mínimas

- parsing del certificado;
- expiración del certificado;
- mismatch de subject/serial/RNC;
- construcción XML;
- validación XSD;
- firmado exitoso;
- firma inválida por mutación;
- generación de código de seguridad;
- QR;
- masking de secretos.

### Pruebas de integración mínimas

- auth DGII mockeada;
- submit mockeado;
- consulta mockeada;
- persistencia de `TrackId`;
- retries/backoff;
- token cache.

### Pruebas funcionales mínimas

- flujo end-to-end de emisión;
- flujo con rechazo;
- flujo `En Proceso` → reconsulta;
- timeout con retry seguro;
- rotación de certificado;
- reinicio del sistema con recuperación de pendientes.

---

## 12. Criterios de aceptación globales

No se considera terminado hasta que se cumplan todos estos puntos:

- XML válido contra XSD;
- XML firmado con algoritmo correcto;
- firma local válida;
- validación local previa al envío;
- auth DGII integrada;
- envío DGII integrado;
- `TrackId` persistido;
- consulta de estado integrada;
- idempotencia implementada;
- retries seguros implementados;
- secretos protegidos;
- logs estructurados con correlación;
- pruebas automáticas ejecutables;
- pruebas funcionales definidas;
- documentación de despliegue y certificación incluida.

---

## 13. Runbook mínimo que el agente debe crear

El agente debe incluir o proponer un runbook con respuesta a incidentes como:

- certificado expirado;
- password del `.p12` incorrecta;
- semilla no disponible;
- token expirado;
- timeout DGII;
- `TrackId` no generado;
- `En Proceso` prolongado;
- rechazo repetido;
- fuga de secretos en logs;
- despliegue con endpoint equivocado;
- certificado de producción usado por error en test.

Cada incidente debe contener:

- síntomas;
- verificación;
- mitigación inmediata;
- corrección permanente;
- evidencia a guardar;
- comunicación operativa sugerida.

---

## 14. Estrategia recomendada de ejecución multiagente

Si usarás varios agentes, sigue esta secuencia:

### Agente A — Arquitectura y control

Usar para:

- consolidar requisitos;
- revisar gaps del repositorio;
- definir arquitectura;
- definir checklist;
- definir matriz de errores;
- definir plan de certificación.

### Agente B — Implementación

Usar para:

- escribir configuración;
- escribir servicios;
- escribir clientes DGII;
- escribir persistencia;
- escribir tests.

### Agente C — Auditoría final

Usar para:

- revisar coherencia técnica;
- revisar huecos de seguridad;
- revisar cobertura de pruebas;
- revisar documentación;
- revisar readiness de certificación.

### Regla de coordinación

Cada agente debe recibir:

- este documento;
- el estado actual del repo;
- la lista de archivos modificados por el agente anterior;
- la salida de tests;
- los gaps todavía abiertos.

---

## 15. Instrucción final para pegar al agente antes de ejecutar

```text
Usa el archivo `prompt_maestro_integracion_ecf_dgii.md` como contrato operativo.
Ejecuta estrictamente por fases.
No avances de fase sin dejar entregables verificables.
No respondas solo con recomendaciones.
Necesito archivos, configuración, código, tests, documentación y checklist.
Adapta todo al stack real del repositorio.
Primero dame el diagnóstico del repo, luego el diff conceptual, luego la implementación por fases.
```

---

## 16. Nota final

Este documento está diseñado para maximizar calidad, trazabilidad y disciplina de ejecución.  
No sustituye la revisión técnica humana ni la validación formal contra los materiales oficiales, fixtures y ambientes reales del proyecto, pero sí fuerza al agente a trabajar con estándar de entrega tipo PR técnico.
