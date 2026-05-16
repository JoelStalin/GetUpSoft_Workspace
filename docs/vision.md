# ORCA Vision

## Problema

Los prompts operativos llegan como texto libre, mensajes incompletos, scripts sueltos o audio informal. Ese material suele mezclar prioridad, contexto, dependencias, definición de terminado y acciones técnicas en un solo bloque ambiguo.

## Visión

ORCA convierte esas entradas en instrucciones estructuradas, trazables y utilizables por equipos Scrum y por modelos de IA posteriores sin que la fase de interpretación consuma tokens remotos.

## Objetivos

- Interpretar entradas humanas de forma local y reproducible.
- Alinear cada solicitud con backlog, sprint, DoR, DoD y plan de pruebas.
- Permitir orquestación posterior con modelos pagos o gratuitos sin exponer la capa de interpretación a dependencia remota.
- Mantener documentación, decisiones y pruebas como parte del flujo normal de entrega.

## No objetivos

- No reemplazar el sistema final que ejecuta código con modelos externos.
- No depender de APIs de IA para inferir intención o limpiar prompts.
- No administrar despliegues completos en este bootstrap.

## Principios

1. Offline first.
2. Trazabilidad Scrum desde el primer commit.
3. Fallos explícitos y recuperables.
4. Contratos de salida validados.
5. Extensibilidad por configuración antes que por hardcode.
