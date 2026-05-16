# Tool Comparison: Obsidian and n8n

## Roles distintos

### Obsidian

- memoria local humana;
- conocimiento versionado en Markdown;
- navegación manual por enlaces y notas;
- costo cero en runtime de ORCA.

### n8n

- orquestación de flujos;
- integración entre servicios y CLIs;
- automatización de triggers, colas y webhooks;
- ejecución operativa más que memoria semántica.

## Recomendación

- usar Obsidian como vault fuente para decisiones, resúmenes, prompts y errores;
- usar n8n más adelante para disparar procesos a partir de esos artefactos;
- no mezclar responsabilidades: Obsidian almacena conocimiento, n8n ejecuta automatizaciones.

## Contrato futuro mínimo para n8n

- input: JSON estructurado emitido por ORCA;
- output: estado del workflow, errores, artefactos generados;
- transporte inicial: archivo local, webhook o CLI.
