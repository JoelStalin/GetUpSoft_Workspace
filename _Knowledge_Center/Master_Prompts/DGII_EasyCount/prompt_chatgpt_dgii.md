# Prompt completo para ChatGPT — Automatización modular en la DGII

Quiero que actúes como un ingeniero senior en automatización web y desarrolles una solución modular en Python para automatizar tareas dentro del portal de la DGII, usando las credenciales que ya te proporcioné previamente en esta conversación, tratándolas siempre como información sensible.

## Objetivo general

Construir un módulo reutilizable, escalable y seguro para automatizar tareas de consulta, navegación, extracción de información, descarga de documentos y generación de reportes dentro de la DGII, sin modificar la página, sin alterar su comportamiento y sin tocar el código del sitio.

## Restricciones obligatorias

- No hagas cambios en la página ni en su código fuente.
- No alteres el DOM, ni inyectes scripts, ni modifiques requests del sitio.
- No evadas captchas, MFA ni controles de seguridad.
- No muestres credenciales, tokens, cookies ni datos sensibles en logs, respuestas, capturas o archivos.
- No ejecutes acciones sensibles automáticamente.
- Si detectas una acción como enviar, declarar, rectificar, pagar, confirmar o firmar, debes detenerte y pedir confirmación antes de continuar.
- No inventes endpoints, selectores ni flujos. Debes detectar todo dinámicamente en la interfaz real.
- No almacenes credenciales en texto plano.
- No reutilices secretos fuera del dominio autorizado de la DGII.

## Tratamiento de credenciales y sesión

- Usa las credenciales ya disponibles en el contexto de esta conversación únicamente para autenticación segura.
- Trátalas como secretos.
- Nunca las imprimas ni las incluyas en logs.
- Mantén la sesión de forma segura.
- Si la sesión expira, implementa reautenticación controlada.
- Nunca expongas cookies, tokens o encabezados sensibles.

## Tecnología requerida

- Python
- Playwright
- Código modular y orientado a producción
- Tipado claro
- Manejo de errores, reintentos y timeouts
- Separación entre navegación, autenticación, extracción y lógica de negocio
- Configuración centralizada
- Uso seguro de secretos
- Salidas estructuradas y reutilizables

## Arquitectura base requerida

Construye la solución con esta arquitectura mínima:

### 1. `auth`
Funciones:
- `login()`
- `validate_session()`
- `refresh_session()`
- `logout()`

Responsabilidades:
- autenticación
- validación de sesión
- recuperación de sesión
- cierre seguro de sesión

### 2. `navigation`
Funciones:
- `go_to_section()`
- `wait_for_page_ready()`
- `resolve_menu()`
- `safe_back()`

Responsabilidades:
- navegación por menús y submenús
- espera de carga
- control de flujo de páginas
- retroceso seguro

### 3. `extract`
Funciones:
- `extract_table()`
- `extract_fields()`
- `extract_messages()`
- `extract_download_links()`
- `normalize_data()`

Responsabilidades:
- lectura de tablas
- extracción de formularios y campos visibles
- captura de mensajes del sistema
- detección de enlaces de descarga
- normalización de resultados

### 4. `tasks`
Funciones:
- `task_consulta_rnc()`
- `task_consulta_comprobantes()`
- `task_consulta_declaraciones()`
- `task_consulta_pagos()`
- `task_descarga_reportes()`
- `task_busqueda_por_periodo()`
- `task_exportacion()`

Responsabilidades:
- encapsular tareas de negocio
- coordinar navegación, extracción y reportes
- exponer flujos reutilizables

### 5. `downloads`
Funciones:
- `download_file()`
- `validate_download()`
- `rename_by_context()`
- `register_download()`

Responsabilidades:
- descargar archivos
- validar tipo de archivo
- renombrar según contexto
- registrar evidencia técnica de cada descarga

### 6. `reporting`
Funciones:
- `build_json_report()`
- `build_csv_report()`
- `build_excel_report()`
- `generate_audit_trace()`

Responsabilidades:
- exportar datos estructurados
- generar trazabilidad
- producir reportes reutilizables

### 7. `safety`
Funciones:
- `detect_sensitive_action()`
- `request_confirmation()`
- `redact_secrets()`
- `safe_logging()`
- `safe_screenshot()`

Responsabilidades:
- detectar acciones sensibles
- bloquear automatizaciones peligrosas
- ocultar secretos
- registrar eventos de forma segura

### 8. `config`
Responsabilidades:
- centralizar configuración
- rutas
- timeouts
- estrategias de reintento
- parámetros de exportación
- variables de entorno

## Modos de ejecución

El sistema debe soportar dos modos:

### 1. Modo solo lectura
Permite:
- iniciar sesión
- navegar
- consultar
- extraer
- descargar
- reportar

### 2. Modo asistido
Permite:
- preparar acciones sensibles
- mostrar resumen de la acción detectada
- pedir confirmación explícita
- ejecutar solo si el usuario lo autoriza

## Requisitos funcionales

El sistema debe ser capaz de:

- Detectar URL actual.
- Detectar formularios, tablas, botones, mensajes y enlaces de descarga.
- Usar selectores robustos y tolerantes a cambios menores.
- Priorizar atributos estables como `id`, `name`, `label`, `aria-label`, texto visible y relaciones semánticas.
- Manejar sesiones expiradas.
- Soportar tablas paginadas.
- Soportar modales.
- Soportar mensajes emergentes.
- Soportar descargas.
- Extraer datos estructurados de forma confiable.
- Exportar resultados a JSON, CSV o Excel.
- Mantener trazabilidad técnica sin exponer secretos.
- Implementar reintentos razonables y timeouts explícitos.
- Reportar errores con contexto técnico claro.

## Reglas de seguridad

- Si detectas operaciones que impliquen declaración, envío, pago, rectificación, firma o confirmación, no las ejecutes automáticamente.
- Antes de cualquier acción sensible, muestra un resumen con:
  - acción detectada
  - datos involucrados
  - impacto esperado
  - riesgo potencial
- Espera autorización explícita antes de continuar.
- Si no hay autorización, cancela la acción.
- Nunca hagas suposiciones sobre endpoints internos ni sobre pasos ocultos del portal.

## Robustez esperada

La solución debe tolerar:

- cambios menores de layout
- cargas lentas
- errores transitorios
- elementos dinámicos
- tablas paginadas
- modales
- mensajes emergentes
- expiración de sesión
- documentos descargables
- diferencias menores entre pantallas similares

## Estándar de implementación

- Usa Python con buenas prácticas de ingeniería.
- Usa Playwright como base de automatización.
- Usa clases y funciones bien separadas.
- Usa tipado y estructuras claras.
- Usa configuración por entorno.
- Usa manejo centralizado de errores.
- Usa logs seguros con redacción de secretos.
- Usa comentarios solo donde aporten valor real.
- Devuelve resultados estructurados.

## Formato de entrega requerido

Quiero que me entregues exactamente en este formato:

### A. Arquitectura propuesta
Describe los módulos, sus responsabilidades y cómo se relacionan.

### B. Estructura de carpetas del proyecto
Muestra el árbol de archivos completo sugerido.

### C. Código base completo en Python con Playwright
Incluye implementación real, no pseudocódigo, separada por archivos.

### D. Ejemplos de tareas automatizadas
Incluye ejemplos concretos como:
- consulta de RNC
- listado de declaraciones
- consulta de pagos
- búsqueda por período
- descarga de acuses o reportes
- exportación de resultados

### E. Validaciones de seguridad y confirmación
Explica e implementa la capa que detecta acciones sensibles y exige autorización previa.

### F. Recomendaciones de despliegue seguro
Incluye recomendaciones sobre:
- manejo de secretos
- ejecución local o servidor
- aislamiento
- control de accesos
- rotación de credenciales
- protección de archivos descargados

### G. Riesgos técnicos y mitigaciones
Lista los principales riesgos del proyecto y cómo mitigarlos.

## Instrucción final

No me des solo teoría.
No me des una explicación general.
No me entregues pseudocódigo.
Quiero una base técnica real, útil, modular, limpia y lista para extender.
Genera el proyecto como si fuera el punto de partida de una implementación profesional.
