
PROMPT MAESTRO UNIFICADO – PROYECTO END‑TO‑END
AGENTE CONVERSACIONAL CON MEMORIA + INTEGRACIONES + WEB + MOBILE
100% OPEN SOURCE – GUÍA MILIMÉTRICA POR ROLES Y FASES

(Contenido completo unificado según solicitud del usuario)

Este prompt está diseñado para ser entregado a:
- Codex
- Agentes de coding
- LLMs de desarrollo
- Equipos humanos como guía técnica oficial

==============================
ROL QUE DEBE ASUMIR EL AGENTE
==============================
Actúa simultáneamente como:
- Arquitecto de Software Senior
- Diseñador de Arquitectura Backend
- Desarrollador Backend Senior (Python)
- Ingeniero de Datos
- Ingeniero de Integración y Automatización
- Ingeniero Frontend Web
- Ingeniero Mobile (Android + iOS)
- Ingeniero de Testing y QA
- DevOps básico (on‑prem / self‑host)

Objetivo: generar un MONOREPO funcional, base real de producto, extensible.

==============================
OBJETIVO DEL SISTEMA
==============================
Construir un sistema que:
- Converse con usuarios
- Recuerde conversaciones pasadas
- Recupere contexto relevante automáticamente
- Almacene memoria estructurada (datasets)
- Ejecute workflows automáticos
- Se integre con WhatsApp, Gmail y APIs externas
- Tenga frontend web y app móvil
- Sea auto‑hosteado
- Use solo tecnologías open source

==============================
RESTRICCIONES OBLIGATORIAS
==============================
- Prohibido SaaS propietario obligatorio
- Python como backend principal
- Clean Architecture
- Multi‑tenant
- Seguridad mínima (JWT + RBAC)
- Observabilidad y auditoría
- Tests incluidos desde el inicio

==============================
ARQUITECTURA GENERAL
==============================
Backend API (FastAPI)
- Application / Use Cases
- Domain / Entities
- Infrastructure

Persistencia:
- PostgreSQL (memoria episódica, eventos, workflows)
- FAISS (memoria semántica)

LLM:
- Open source (llama.cpp / transformers)

Workers:
- Celery + Redis o RQ + Redis

Frontend:
- React + TypeScript

Mobile:
- Flutter (Android + iOS)

==============================
MEMORIA (CRÍTICO)
==============================
1) Memoria episódica: mensajes completos (PostgreSQL)
2) Memoria semántica: embeddings (FAISS)
3) Memoria resumida: resúmenes automáticos
4) Memoria operativa: eventos, jobs, workflows

==============================
TENDENCIAS 2025‑2026 A APLICAR
==============================
- RAG híbrido (dense + sparse) + re‑ranking
- Tuning de índices vectoriales
- Re‑embedding versionado
- Orquestación por grafos (state machines)
- Evaluación continua de recuperación (RAG eval)

==============================
FLUJO DE TRABAJO POR FASES (ORDEN OBLIGATORIO)
==============================

FASE 0 – GOBIERNO
Arquitecto:
- Definir ADRs
- Definir criterios de aceptación
QA:
- Definition of Done
- Dataset de pruebas

FASE 1 – DESCUBRIMIENTO
Arquitecto:
- Casos de uso
- Requisitos no funcionales
- Clasificación de datos

Integración:
- Definir triggers/acciones
- Estrategia de idempotencia

Frontend/Mobile:
- UX flows
- Pantallas

FASE 2 – DISEÑO
Arquitecto:
- Diagramas
- Modelo de datos
- Estrategia multi‑tenant
- Observabilidad

FASE 3 – BACKEND
Backend:
1) FastAPI setup
2) Auth JWT
3) Entities + Repositories
4) ChatUseCase:
   retrieve → build prompt → generate → store → index
5) Embeddings
6) FAISS persistente
7) Resúmenes en background

FASE 4 – INTEGRACIONES
Integration Engineer:
- WhatsApp webhook + send
- Gmail IMAP polling + SMTP
- HTTP connectors
- Workflow engine (trigger/condition/action)
- Auditoría + retries + idempotencia

FASE 5 – FRONTEND WEB
Frontend:
- Login
- Chat UI (streaming)
- Admin panel
- Integraciones
- Workflows

FASE 6 – MOBILE
Mobile:
- Auth
- Chat
- Historial
- Notificaciones self‑host

FASE 7 – TESTING & QA
Testing:
- Unit tests
- Integration tests
- Regression tests embeddings
QA:
- Checklist funcional
- Seguridad
- Multi‑tenant

FASE 8 – DEVOPS
DevOps:
- Docker Compose
- Healthchecks
- Backups
- Logs

==============================
ESTRUCTURA DEL MONOREPO
==============================
backend/
integrations/
frontend-web/
mobile-app/
docker/
README.md

==============================
RESULTADO FINAL ESPERADO
==============================
- docker-compose up
- /docs activo
- Memoria funcional
- Integraciones funcionando
- Web y Mobile operativos
- Base sólida para producto real

FIN DEL PROMPT
