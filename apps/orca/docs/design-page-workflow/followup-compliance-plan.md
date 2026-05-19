# Plan de seguimiento y cumplimiento

## Cadencia

- Diario durante implementacion: revisar estado de tareas, bloqueos y evidencia.
- Por hito: validar salida contra el brief y registrar decision en memoria.
- Antes de publicar: revisar checklist SEO, accesibilidad, performance, assets y funcionalidad.
- Despues de publicar: monitorear errores, Core Web Vitals, formularios y tracking.

## Estados

- `draft`: idea registrada.
- `researching`: investigacion activa.
- `planned`: planes completos.
- `in_build`: implementacion en curso.
- `qa_ready`: listo para pruebas.
- `blocked`: requiere decision o credencial.
- `approved`: cumple criterios.
- `published`: desplegado.

## Evidencia obligatoria por proyecto

- Brief normalizado.
- Investigacion.
- Sitemap.
- UX page map.
- Copy principal.
- Asset manifest.
- Animation manifest.
- SEO manifest.
- i18n manifest si aplica.
- Reporte Selenium o equivalente.
- Reporte de imagenes rotas.
- Reporte accesibilidad.
- Registro de publicacion.

## Reglas de cumplimiento

- No usar assets con texto incrustado si el sitio es bilingue, salvo versiones separadas por idioma.
- Todo flujo debe tener fallback si falla WebGL, video o NotebookLM.
- Todo proyecto debe producir memoria Obsidian y paquete NotebookLM.
- Todo workflow n8n importado debe tener version, owner, alcance y rollback.
- No se guardan secretos en JSON del workflow.

