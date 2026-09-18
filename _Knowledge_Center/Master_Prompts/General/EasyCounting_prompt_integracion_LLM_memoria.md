# Prompt detallado para integrar IA multi-modelo y memoria de largo plazo en EasyCounting

## Rol

Actúa como **Principal Software Architect**, **Senior FastAPI Engineer**, **AI Platform Engineer**, **LLM Systems Designer** y **Staff Backend Engineer**.

Tu trabajo es **analizar y modificar el repositorio real** para convertirlo en una plataforma de IA multi-modelo, con **memoria de corto y largo plazo**, con prioridad en **open source self-hosted por defecto**, y con capacidad opcional para que el usuario o tenant configure credenciales externas para **Claude**, **ChatGPT/OpenAI**, **Gemini** y otros endpoints compatibles.

---

## Repositorio objetivo

Repositorio real a inspeccionar y modificar:

```text
https://github.com/JoelStalin/EasyCounting.git
```

---

## Modo de trabajo obligatorio

1. **Inspecciona primero el repositorio completo.**
2. **No inventes archivos, rutas, clases o servicios** si no existen; primero verifica.
3. **Reutiliza y extiende la base existente** en vez de reescribir todo desde cero.
4. **Mantén compatibilidad hacia atrás** cuando sea razonable.
5. **No rompas seguridad, multi-tenancy ni flujos fiscales** del sistema.
6. **No mezcles datos entre tenants.**
7. **No introduzcas dependencias cerradas como requisito obligatorio** para que el sistema funcione.
8. **La opción predeterminada del sistema debe ser open source self-hosted.**
9. **Los proveedores comerciales externos deben ser opcionales** y configurables por usuario/tenant mediante API key o token.
10. Todo debe quedar orientado a **producción**, con migraciones, pruebas y documentación.

---

## Contexto validado que debes confirmar en el código

Debes confirmar esto contra el código real y partir desde ahí:

- El backend está basado en **FastAPI**.
- El sistema corre con **PostgreSQL**, **Redis**, **Docker**, **Nginx**, observabilidad y jobs.
- Ya existe un endpoint de chat para cliente.
- Ya existe un servicio de chat por tenant.
- Ya existe configuración LLM en settings.
- Ya existe una tabla/configuración de proveedores IA de plataforma.
- El sistema actual ya parece soportar al menos:
  - `openai`
  - `gemini`
  - `openai_compatible`
- El sistema actual todavía **no** tiene memoria de largo plazo real.
- El sistema actual parece responder con:
  - reglas locales
  - contexto de facturas
  - fallback hacia proveedor externo
- La arquitectura existente debe ser **extendida**, no ignorada.

---

## Objetivo principal

Quiero convertir **EasyCounting** en una plataforma con estas capacidades:

### 1. Multi-modelo real
Debe poder usar varios modelos según:
- proveedor por defecto del sistema
- proveedor por tenant
- proveedor por usuario
- proveedor por caso de uso
- fallback automático
- prioridades configurables

### 2. Open source self-hosted por defecto
Los LLM open source que corran self-hosted deben venir **preconfigurados y predeterminados**.

El sistema debe funcionar **out-of-the-box** sin requerir ninguna API key externa.

### 3. Proveedores externos opcionales
El usuario o tenant debe poder agregar sus propias credenciales para:
- Claude / Anthropic
- ChatGPT / OpenAI
- Gemini
- otros endpoints OpenAI-compatible

### 4. Memoria de largo plazo real
No quiero solo “pasar contexto reciente”. Quiero:
- historial persistente de conversaciones
- memoria semántica
- recuperación de contexto relevante
- resúmenes automáticos
- políticas de retención
- aislamiento estricto por tenant

### 5. Producción
Todo debe quedar listo para operar con:
- settings
- modelos
- migraciones
- endpoints
- seguridad
- pruebas
- documentación
- estrategia de despliegue

---

# Requisito crítico sobre proveedores

## Comportamiento deseado

### A. Predeterminado del sistema
Los modelos open source self-hosted deben quedar como **default de plataforma**.

Ejemplos válidos:
- LiteLLM como gateway
- vLLM
- Ollama
- OpenAI-compatible local
- combinaciones de los anteriores

### B. Configuración opcional por tenant/usuario
Además del default self-hosted, el usuario o tenant debe poder registrar proveedores externos con credenciales propias.

Debe ser posible guardar:
- `provider_type`
- `display_name`
- `base_url`
- `model`
- `auth_mode`
- `api_key` o `bearer_token`
- `extra_headers`
- `timeout`
- `max_tokens`
- `enabled`
- `is_default`

### C. Precedencia de resolución
Implementa una jerarquía clara para seleccionar proveedor:

1. proveedor específico del usuario
2. proveedor por defecto del tenant
3. proveedor por defecto de plataforma
4. proveedor open source self-hosted predeterminado

Si no existe proveedor externo configurado, el sistema debe seguir funcionando con la infraestructura local.

---

# FASE 1 — Auditoría técnica exhaustiva

Inspecciona el repositorio y entrega una auditoría precisa de:

## 1. Arquitectura actual
Identifica:
- entrypoints
- routers
- servicios de aplicación
- modelos SQLAlchemy
- settings
- jobs/cron/background runners
- middleware
- autenticación
- seguridad
- flujos multi-tenant
- capas de integración externa

## 2. IA actual
Ubica y explica:
- dónde vive el servicio de chat actual
- cómo se resuelven proveedores
- qué tipos de proveedores soporta hoy
- cómo se guardan las credenciales
- cómo se construye el prompt/contexto
- cómo se hace el fallback
- qué endpoints ya existen
- qué datos usa como contexto
- limitaciones actuales

## 3. Gaps técnicos
Enumera al menos:
- ausencia de Anthropic/Claude
- falta de memoria persistente de conversación
- falta de memoria semántica
- falta de embeddings/vector store
- acoplamiento excesivo del servicio de chat
- falta de resolución por tenant/usuario
- falta de UI o endpoints de administración adecuados
- carencias de seguridad / compliance / trazabilidad
- limitaciones del fallback actual
- riesgos de costo y latencia

---

# FASE 2 — Diseño objetivo

Diseña una arquitectura realista para este repositorio.

## 2.1 Capa de abstracción de proveedores

Refactoriza para que la lógica de proveedores no viva mezclada dentro del servicio de chat.

Crea una capa limpia, por ejemplo:

- `BaseLLMProvider`
- `OpenAIProvider`
- `GeminiProvider`
- `AnthropicProvider`
- `OpenAICompatibleProvider`
- `LiteLLMProvider`
- `LocalProviderResolver`
- `ProviderSelectionService`

Debes decidir la estructura final basándote en el repo real.

### Reglas:
- separar selección de proveedor de ejecución del prompt
- separar autenticación del formato de request
- separar memoria/contexto del transporte HTTP
- soportar timeout, retry, fallback, observabilidad y errores controlados

---

## 2.2 Soporte obligatorio para Claude / Anthropic

Añade soporte completo para `anthropic` como `provider_type`.

Debe incluir:
- configuración
- persistencia
- runtime
- adaptador HTTP
- parseo de respuesta
- system prompt
- tokens máximos
- timeout
- manejo de errores
- pruebas

Debe integrarse con la arquitectura existente sin romper OpenAI, Gemini ni OpenAI-compatible.

---

## 2.3 Open source self-hosted como ruta principal

### Opción recomendada
Diseña el sistema priorizando esta pila:

- **LiteLLM** como gateway unificado
- **PostgreSQL + pgvector** para memoria semántica
- **Redis** para cache, session hints o colas auxiliares
- **vLLM** u **Ollama** para modelos locales
- compatibilidad opcional con:
  - Anthropic
  - OpenAI
  - Gemini

### Resultado esperado
Tu aplicación debe poder apuntar a:
- un gateway local tipo LiteLLM
- un endpoint OpenAI-compatible local
- uno o varios modelos OSS self-hosted
- proveedores SaaS opcionales

### Importante
No quiero vendor lock-in fuerte. El sistema debe seguir funcionando aunque ningún SaaS esté configurado.

---

## 2.4 Routing multi-modelo

Quiero un router real de inferencia, no solo “usar el default”.

Debe poder decidir por:
- tipo de tarea
- complejidad
- latencia
- costo
- disponibilidad
- tenant
- configuración del usuario

### Casos de uso mínimos
Implementa al menos una estrategia para:
- lookup operacional
- resumen
- análisis
- clasificación
- redacción
- memoria/síntesis

### Ejemplo deseado
- consultas operativas simples → motor local o reglas
- consultas de análisis → modelo más potente
- si falla un proveedor SaaS → fallback a self-hosted
- si un tenant definió proveedor propio → usarlo primero
- si no existe nada → usar default open source de plataforma

---

# FASE 3 — Memoria de corto y largo plazo

## 3.1 Memoria de conversación
Implementa persistencia real para conversaciones.

Propón y crea modelos como:
- `chat_sessions`
- `chat_messages`

Campos sugeridos:
- `id`
- `tenant_id`
- `user_id`
- `session_title`
- `created_at`
- `updated_at`
- `last_message_at`
- `message_role`
- `message_text`
- `provider_used`
- `model_used`
- `tokens_input`
- `tokens_output`
- `latency_ms`
- `status`
- `metadata_json`

Ajusta nombres y tipos según el estilo real del repo.

## 3.2 Memoria semántica
Implementa una capa de memoria persistente y recuperable, por ejemplo:
- `tenant_memory_items`

Campos sugeridos:
- `id`
- `tenant_id`
- `user_id` opcional
- `scope` (`tenant`, `user`, `session`, `system`)
- `memory_type` (`preference`, `fact`, `summary`, `policy`, `document`, `note`)
- `source_type`
- `source_ref`
- `content`
- `summary`
- `embedding`
- `importance_score`
- `freshness_score`
- `access_count`
- `last_accessed_at`
- `expires_at`
- `created_at`
- `updated_at`
- `metadata_json`

## 3.3 Embeddings
Diseña e implementa una estrategia de embeddings.

Requisitos:
- usar `pgvector` en PostgreSQL si es posible
- si no está listo, deja contrato claro para integrarlo
- permitir embeddings locales o externos
- top-k semántico filtrado por `tenant_id`
- filtros por tipo, fecha y scope

## 3.4 Recuperación de contexto
Antes de llamar al modelo, el sistema debe poder:
1. recuperar sesión actual
2. recuperar mensajes recientes
3. recuperar memorias semánticas relevantes
4. recuperar hechos o preferencias persistentes
5. recuperar contexto operacional autorizado
6. construir un prompt final con contexto mínimo necesario

## 3.5 Política de memoria
Define e implementa reglas claras sobre:
- qué guardar
- qué resumir
- qué fusionar
- qué expirar
- qué nunca persistir

### Muy importante
No persistir indiscriminadamente:
- secretos
- certificados
- passwords
- tokens
- XML firmados sensibles
- datos fiscales innecesarios fuera de contexto controlado

---

# FASE 4 — Multi-tenancy y seguridad

## 4.1 Aislamiento estricto
Nunca se debe mezclar información entre tenants.

Todo acceso a memoria o chat debe filtrar por:
- `tenant_id`
- opcionalmente `user_id`
- permisos del actor autenticado

## 4.2 Guardrails
Implementa reglas para que el asistente:
- no consulte ni mencione datos de otros tenants
- se niegue si la pregunta intenta salir del ámbito autorizado
- indique claramente cuando el contexto es insuficiente
- no invente datos fiscales ni administrativos

## 4.3 Secret management
Las credenciales de proveedores deben:
- almacenarse cifradas
- no loguearse
- no devolverse en texto plano
- poder enmascararse en respuestas administrativas

## 4.4 Auditoría y trazabilidad
Registrar:
- proveedor usado
- modelo usado
- tiempo de respuesta
- fallback activado o no
- tipo de consulta
- errores
- origen del contexto

---

# FASE 5 — Persistencia de proveedores IA

## 5.1 Mantener y extender lo existente
Si ya existe una tabla de proveedores IA de plataforma, **reutilízala**.

### Debes evaluar si conviene:
- mantener `platform_ai_providers`
- extenderla
- o crear una nueva tabla complementaria

## 5.2 Añadir soporte por tenant/usuario
Debes diseñar al menos una tabla como:
- `tenant_ai_providers`
- opcionalmente `user_ai_providers`

### Debe permitir:
- override por tenant
- override por usuario
- default por tenant
- enabled/disabled
- credenciales cifradas
- auth flexible
- headers extra
- selección de modelo

## 5.3 auth_mode
Soporta varios modos:
- `none`
- `api_key`
- `bearer`
- `x_api_key`
- `custom_headers`

---

# FASE 6 — API y contratos

Extiende el sistema actual con endpoints claros.

## 6.1 Mantener compatibilidad
Si hoy existe algo como `/cliente/chat/ask`, intenta mantenerlo.

## 6.2 Propón una v2 más sólida
Ejemplo de endpoints posibles:

### Chat
- `POST /api/v1/cliente/chat/ask`
- `POST /api/v1/cliente/chat/sessions`
- `GET /api/v1/cliente/chat/sessions`
- `GET /api/v1/cliente/chat/sessions/{session_id}`
- `GET /api/v1/cliente/chat/sessions/{session_id}/messages`
- `POST /api/v1/cliente/chat/sessions/{session_id}/messages`

### Memoria
- `GET /api/v1/cliente/chat/memory/search`
- `GET /api/v1/cliente/chat/memory`
- `POST /api/v1/cliente/chat/memory`
- `PATCH /api/v1/cliente/chat/memory/{memory_id}`
- `DELETE /api/v1/cliente/chat/memory/{memory_id}`

### Proveedores IA
- `GET /api/v1/cliente/ai/providers`
- `POST /api/v1/cliente/ai/providers`
- `PATCH /api/v1/cliente/ai/providers/{provider_id}`
- `DELETE /api/v1/cliente/ai/providers/{provider_id}`
- `POST /api/v1/cliente/ai/providers/{provider_id}/test`
- `POST /api/v1/cliente/ai/providers/{provider_id}/set-default`

### Administración de plataforma
- `GET /api/v1/admin/ai/providers`
- `POST /api/v1/admin/ai/providers`
- `PATCH /api/v1/admin/ai/providers/{provider_id}`
- `POST /api/v1/admin/ai/providers/{provider_id}/set-default`

Debes decidir la estructura final según los routers y patrones reales del repo.

---

# FASE 7 — Integración con el servicio actual de chat

Analiza el servicio de chat actual y refactorízalo.

## Requisitos de refactor
- separar preprocess
- separar recuperación de contexto
- separar memoria
- separar selección de proveedor
- separar ejecución LLM
- separar fallback
- separar postproceso y fuentes

## Quiero idealmente módulos como:
- `chat_orchestrator.py`
- `provider_selector.py`
- `memory_service.py`
- `conversation_service.py`
- `prompt_builder.py`
- `llm_clients/`
- `embeddings_service.py`

Usa nombres acordes al repo real.

---

# FASE 8 — Base de datos y migraciones

## 8.1 Alembic
Genera migraciones concretas para:
- tablas de conversación
- tablas de memoria
- columnas nuevas necesarias
- tablas de providers por tenant/usuario
- soporte `pgvector` si aplica

## 8.2 Compatibilidad
Evita romper migraciones existentes.

## 8.3 Datos seed iniciales
Propón o implementa seed para proveedores por defecto de plataforma:
- LiteLLM / local gateway
- OpenAI-compatible local
- Ollama o vLLM si aplica

---

# FASE 9 — Settings y configuración

Extiende settings con variables claras.

## Variables deseadas
Ejemplos:

- `AI_DEFAULT_PROVIDER_STRATEGY`
- `AI_DEFAULT_LOCAL_PROVIDER`
- `AI_ENABLE_PLATFORM_DEFAULTS`
- `AI_ENABLE_TENANT_PROVIDERS`
- `AI_ENABLE_USER_PROVIDERS`
- `AI_ENABLE_LONG_TERM_MEMORY`
- `AI_ENABLE_EMBEDDINGS`
- `AI_EMBEDDINGS_PROVIDER`
- `AI_EMBEDDINGS_MODEL`
- `AI_EMBEDDINGS_BASE_URL`
- `AI_EMBEDDINGS_API_KEY`
- `AI_MEMORY_TOP_K`
- `AI_MEMORY_MAX_ITEMS`
- `AI_MEMORY_SUMMARIZATION_ENABLED`
- `AI_MEMORY_RETENTION_DAYS`
- `AI_LOCAL_GATEWAY_BASE_URL`
- `AI_LOCAL_DEFAULT_MODEL`
- `AI_FALLBACK_TO_LOCAL`
- `AI_PROVIDER_TEST_TIMEOUT_SECONDS`

Debes adaptarlas al estilo del proyecto real.

---

# FASE 10 — Observabilidad, confiabilidad y costo

## Requisitos
- logs estructurados
- métricas por proveedor/modelo
- conteo de tokens si es posible
- latencia por llamada
- errores por proveedor
- tasa de fallback
- trazabilidad por request

## También quiero
- timeouts razonables
- retries donde apliquen
- circuit breakers si tiene sentido
- manejo claro de errores de API externa
- degradación elegante al motor local o reglas

---

# FASE 11 — Pruebas

Quiero pruebas reales.

## Deben cubrir al menos:
1. selección de proveedor por jerarquía
2. uso del default self-hosted
3. override por tenant
4. override por usuario
5. soporte de Anthropic
6. soporte de OpenAI-compatible
7. fallback cuando falla proveedor externo
8. aislamiento estricto entre tenants
9. recuperación de memoria
10. persistencia de conversaciones
11. seguridad de credenciales
12. endpoints CRUD de providers y memoria
13. regresión del endpoint de chat existente

Si hay tests ya presentes, intégrate a su estilo.

---

# FASE 12 — Documentación

Actualiza documentación del proyecto.

## Incluye:
- arquitectura AI
- providers soportados
- prioridad de resolución
- cómo registrar un proveedor del tenant
- cómo configurar Claude/OpenAI/Gemini
- cómo habilitar el gateway local
- cómo funciona la memoria
- riesgos de seguridad
- ejemplos de uso
- ejemplos de `.env`
- guía de despliegue

---

# FASE 13 — Entregables obligatorios

Quiero que me entregues, en este orden:

## 1. Auditoría del repo
- arquitectura real
- piezas existentes
- huecos/gaps

## 2. Diseño recomendado
- arquitectura final
- decisiones técnicas
- compromisos
- razones

## 3. Plan de implementación por fases
- fase 1 mínima
- fase 2 intermedia
- fase 3 completa

## 4. Lista de archivos a crear/modificar
Por archivo, explica:
- por qué se toca
- qué cambia
- impacto

## 5. Migraciones
- tablas nuevas
- columnas nuevas
- índices
- constraints

## 6. Código o patch propuesto
Entrega cambios concretos, no solo teoría.

## 7. Pruebas
- nuevas
- adaptadas
- estrategia de cobertura

## 8. Documentación
- README
- docs técnicas
- ejemplos

## 9. Riesgos y siguientes pasos
- deuda técnica
- riesgos operativos
- rollout sugerido

---

# Restricciones importantes

## No debes hacer
- no exponer secretos en logs
- no guardar claves en texto plano
- no usar memoria compartida entre tenants
- no depender obligatoriamente de SaaS
- no reescribir el proyecto entero sin necesidad
- no romper el endpoint actual de chat si puede mantenerse

## Sí debes hacer
- reutilizar piezas existentes
- aislar responsabilidades
- mantener seguridad multi-tenant
- dar una solución evolutiva
- priorizar open source self-hosted como default
- permitir configuración externa por usuario/tenant

---

# Decisiones recomendadas que debes evaluar e implementar si encajan

## Proveedor default de plataforma
Implementar uno de estos como default del sistema:
- LiteLLM apuntando a modelos locales
- OpenAI-compatible local
- Ollama
- vLLM

## Proveedor por tenant/usuario
Permitir registrar:
- Anthropic
- OpenAI
- Gemini
- OpenAI-compatible
- LiteLLM externo si aplica

## Estrategia de memoria
- PostgreSQL + pgvector
- mensajes persistidos
- memorias importantes resumidas
- embeddings por item
- búsqueda top-k con filtros por tenant

## Estrategia de orquestación
- reglas locales para consultas operativas simples
- LLM para análisis y redacción
- fallback automático a local
- restricción estricta por tenant

---

# Criterios de aceptación

La tarea se considera bien resuelta solo si:

1. El sistema puede funcionar sin credenciales SaaS externas.
2. Existe un proveedor open source self-hosted configurado por defecto.
3. Un usuario o tenant puede registrar su propia API key o token para usar Claude, ChatGPT o Gemini.
4. Claude/Anthropic queda soportado realmente.
5. Existe memoria persistente de conversación.
6. Existe memoria semántica o un contrato claro y funcional para implementarla.
7. Hay aislamiento multi-tenant estricto.
8. Hay migraciones y pruebas.
9. El diseño encaja con la arquitectura real del repo.
10. La solución es mantenible y orientada a producción.

---

# Formato de respuesta esperado

Primero responde con:

## A. Auditoría del repo
- arquitectura encontrada
- piezas IA encontradas
- límites actuales

## B. Diseño propuesto
- visión general
- diagrama textual
- providers
- memoria
- endpoints
- seguridad

## C. Implementación
- archivos a crear/modificar
- migraciones
- settings
- servicios
- routers
- tests

## D. Patch o código
- cambios concretos
- snippets o diff
- explicación breve por bloque

## E. Plan de rollout
- MVP
- fase 2
- fase 3

---

# Instrucción final

Trabaja **sobre el repositorio real**, valida todo contra el código y produce una solución concreta, detallada y lista para implementarse.

No me des una respuesta genérica. Quiero una propuesta **aterrizada a EasyCounting**, basada en los archivos, rutas, servicios y patrones reales del proyecto.
