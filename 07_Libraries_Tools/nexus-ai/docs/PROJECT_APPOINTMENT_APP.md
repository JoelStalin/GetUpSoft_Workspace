# PROYECTO CENTRAL: App de Citas para Joyería (Galante's Jewelry)

**Estado:** Inicialización (Pre-producción validada)
**Objetivo Principal:** Crear una aplicación de agendamiento de citas (Appointments App) conectada a Google Calendar para que los clientes de una joyería puedan reservar servicios de reparación y consultas especializadas.
**Restricción Crítica:** Minimizar el uso de tokens externos (OpenAI/Anthropic/Gemini) delegando la mayor cantidad de lógica posible a los **workers locales** de AIHUB (Local-First).

---

## 1. Contexto del Proyecto (Timeline & Memoria)

Este proyecto servirá como la **Prueba de Concepto (PoC) definitiva** para validar que la plataforma AIHUB y su arquitectura de workers locales (Pointer-First, Local-First, Governance-Driven) funcionan correctamente en un escenario del mundo real.

### Componentes de la Solución
1.  **Frontend (Cliente):** Una interfaz web sencilla (React/Next.js o Vanilla HTML/JS) donde el cliente selecciona el tipo de servicio (Reparación, Diseño Personalizado, Consulta) y una fecha/hora.
2.  **Orquestación (Backend/n8n):** Flujos de automatización en n8n que reciben la solicitud, consultan disponibilidad, y manejan la lógica de negocio.
3.  **Inteligencia y Procesamiento (AIHUB):**
    -   `translator-worker`: Para normalizar y estructurar los mensajes de entrada de los clientes si incluyen texto libre o descripciones de su problema (ej. "mi reloj no da la hora").
    -   `integration-engineer`: Para estructurar y validar la integración con la API de Google Calendar y asegurar que no haya fallas de autenticación.
    -   `data-miner`: Para procesar históricos de citas y extraer reportes sin gastar tokens en IA.
    -   `worker-compliance` y `worker-auditor`: Para asegurar que la cita se generó correctamente antes de notificar al cliente.
4.  **Almacenamiento y Notificación (Google Calendar / Email):** Donde se registra finalmente la cita y se notifica al usuario.

---

## 2. PROMPT MAESTRO (Objetivo Principal para AIHUB)

Este prompt debe ser utilizado como el disparador inicial para que el orquestador (`agent-recruiter` o n8n) comience a asignar tareas a los workers de AIHUB.

```txt
[PRIMARY_OBJECTIVE_PROMPT]
KERNEL MODE ENABLED
JOB_TYPE: build_appointment_system
PROJECT_ID: jewelry-appointments-001

Misión Principal: Construir una aplicación de agendamiento de citas conectada a Google Calendar para servicios de joyería (reparaciones y consultas).

RESTRICCIÓN CRÍTICA: Debes operar bajo la filosofía "Local-First". Minimiza el uso de modelos LLM externos. Usa lógica determinista, plantillas, y scripts locales siempre que sea posible.

PASOS REQUERIDOS (Step-by-Step Execution):

PASO 1: ESTRUCTURA DE INTEGRACIÓN (integration-engineer)
- Diseñar el payload estándar de solicitud de cita (Nombre, Email, Tipo de Servicio, Descripción, Fecha, Hora).
- Diseñar el contrato de integración con Google Calendar API (OAuth2, crear evento, buscar huecos).
- Salida esperada: integrationContract (JSON).

PASO 2: AUTOMATIZACIÓN DE FLUJO (workflow-automation-worker)
- Diseñar la especificación del flujo de n8n para: 
  a) Recibir el Webhook del frontend.
  b) Llamar al AIHUB (translator-worker) si la descripción del problema necesita ser categorizada.
  c) Llamar a la API de Google Calendar.
  d) Enviar confirmación (Mock de email o respuesta HTTP).
- Salida esperada: n8n Workflow Spec (JSON).

PASO 3: PROCESAMIENTO DE LENGUAJE NATURAL (translator-worker)
- Definir las reglas locales (regex o heurísticas simples) para clasificar descripciones de usuarios en tres categorías: REPARACIÓN, CONSULTA, DISEÑO, sin usar tokens de IA.
- Salida esperada: Clasificador determinista local.

PASO 4: VALIDACIÓN Y AUDITORÍA (worker-compliance)
- Definir los criterios de éxito (successCriteria) para asegurar que ninguna cita se guarde sin email válido y fecha en el futuro.
- Salida esperada: complianceRules.

Ejecuta el PASO 1 ahora y espera confirmación.
[/PRIMARY_OBJECTIVE_PROMPT]
```

---

## 3. Timeline de Ejecución

-   **Fase 0 (Completada):** Preparación del entorno pre-producción, validación de workers (translator, memory, data-miner) y despliegue del Sandbox (n8n).
-   **Fase 1 (Actual):** Definición del Objetivo Central (Este documento). Asignación de tareas de arquitectura a los workers locales.
-   **Fase 2:** Creación de los contratos de integración con Google Calendar (`integration-engineer`).
-   **Fase 3:** Construcción del flujo orquestador en n8n (`workflow-automation-worker`).
-   **Fase 4:** Implementación de la interfaz mínima web (Frontend).
-   **Fase 5:** Pruebas End-to-End (E2E) simulando a un cliente reservando una cita. Validación de ahorro de tokens y correcta gobernanza (Auditoría/Policía).

---

## 4. Métricas de Éxito

Para que este proyecto demuestre el valor de AIHUB, debe cumplir con:
1.  **Cero Tokens Gastados en Tareas Triviales:** La validación de fechas, el enrutamiento y la extracción de datos deben hacerse con scripts locales (Local-First).
2.  **Memoria Persistente (L1/L2):** El sistema debe recordar (a través de `memory-agent`) si un cliente ya había sido procesado o si un patrón de integración ya fue diseñado.
3.  **Trazabilidad:** Cada paso del agendamiento debe estar registrado por `worker-auditor`.
