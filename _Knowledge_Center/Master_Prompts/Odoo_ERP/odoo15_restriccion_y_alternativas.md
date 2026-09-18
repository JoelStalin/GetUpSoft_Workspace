"Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!"


# Solicitud: endpoint + SQL + CSV en Odoo 15

## Modo
AUTO (BASIC)

## Resumen del entendimiento
Quieres un **prompt** para que otra IA te genere un **endpoint** en Odoo **15** que ejecute una **consulta SQL** sobre *move_line* (típicamente `account_move_line` / modelo `account.move.line`) y devuelva los resultados en un **archivo `.csv`**.

## Restricción de versión (CRÍTICA)
Este asistente **solo acepta Odoo v17+ (v17, v18, v19 si existe públicamente)**.  
➡️ Por tanto, **no puedo entregarte un prompt orientado a Odoo 15**.

### Alternativas seguras que sí puedo darte
1) Un prompt equivalente para **Odoo v17+** (ya te lo compartí antes).  
2) Una guía/prompt de **migración** (Odoo 15 → 17) para implementar el endpoint correctamente en v17+.

## Estado de evidencias
No se proporcionaron evidencias (código, logs, requisitos exactos). Se trabajará con supuestos razonables.

## Pregunta obligatoria sobre evidencias
**¿Dispones de alguna de las siguientes evidencias que puedas compartir?**
- Traceback completo / logs del servidor (si ya intentaste hacerlo).
- Código actual del módulo/controlador (si existe).
- Columnas exactas que quieres en el CSV.
- Filtros exactos (por fecha, cuenta, compañía, partner, diario, etc.).
- Volumen estimado (¿miles? ¿millones?) para diseñar paginación/streaming.

## Checklist de validación (para cuando migres a v17+)
- [ ] Endpoint protegido con `auth="user"` + grupo/permiso
- [ ] Respeta multi-company y record rules
- [ ] SQL parametrizado (si se usa) y sin concatenación
- [ ] Límite o paginación para no tumbar el servidor
- [ ] CSV descargable con headers correctos y UTF-8
