# ADR-0002: Obsidian as Local Knowledge Vault

- Fecha: 2026-05-15
- Estado: accepted

## Contexto

ORCA necesita una memoria local gratuita y legible por humanos para guardar decisiones, resúmenes de sesión, prompts, errores y estado del proyecto sin depender de servicios pagados.

## Decisión

Se adopta Obsidian como vault local de conocimiento por su compatibilidad con Markdown, enlaces internos y operación offline. ORCA mantendrá los documentos fuente en `docs/` y podrá sincronizar o exportar al vault sin acoplar el runtime a Obsidian.

## Consecuencias

### Positivas

- memoria local gratuita;
- formato Markdown portable;
- fácil indexación manual o automatizada;
- compatible con flujos futuros de n8n.

### Negativas

- requiere convención de carpetas y nombres;
- sincronización bidireccional queda para un sprint posterior.

## Alternativas descartadas

- Base de datos local como única memoria: menos legible para sesiones humanas.
- Notion o SaaS equivalente: rompe la premisa offline-first.
