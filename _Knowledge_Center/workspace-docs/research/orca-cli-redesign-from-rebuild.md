# ORCA CLI Redesign from re-build.zip

## Fuente inspeccionada

- archivo local: `C:\Users\yoeli\Downloads\re-build.zip`

## Hallazgos útiles

El ZIP contiene una reconstrucción de un CLI grande en Node con estas señales:

- entrypoint único y discoverable;
- comandos agrupados por familias;
- foco en experiencia de terminal antes que en APIs dispersas;
- capacidades de diagnóstico y operación;
- separación entre runtime, build y comandos de usuario.

## Decisiones adoptadas en ORCA

- mantener un entrypoint `orca` único;
- introducir subcomandos por familias:
  - `prompt`
  - `jarvis`
  - `backlog`
  - `skills`
  - `service`
  - `doctor`
- mantener compatibilidad con comandos anteriores;
- privilegiar salida JSON legible y scriptable.

## Decisiones NO adoptadas

- no portar el runtime Node/React/Ink;
- no incorporar dependencias de ese proyecto al core Python;
- no copiar la arquitectura reconstruida;
- no mover ORCA fuera de `Typer`.

## Resultado

La CLI de ORCA mejora en descubribilidad y operación, pero sigue alineada con:

- núcleo offline;
- contratos Python;
- backlog Scrum;
- compatibilidad con automatización local.
