# Project Status

## Resumen

ORCA ya cuenta con un bootstrap funcional para:

- backlog y gobierno Scrum;
- normalización local de prompts;
- extracción determinística de señales;
- clasificación local con scikit-learn;
- routing por skills YAML;
- mapeo Scrum;
- generación de prompts para ejecución y recuperación;
- CLI local, API HTTP y CI.
- pipeline Jarvis por contratos inspirado en OpenTypeless;
- provider local explícito `VoskSTTProvider` bajo el contrato `STTProvider`;
- historial Jarvis accesible desde CLI con opt-in y borrado explícito;
- política explícita de ejecución autónoma para culminar tareas completas.

## Sprints

- `SPRINT-0`: completado
- `SPRINT-1`: completado
- `SPRINT-2`: completado
- `SPRINT-3`: completado
- `SPRINT-4`: completado
- `SPRINT-5`: completado
- `SPRINT-6`: completado
- `SPRINT-7`: en progreso
- `SPRINT-8`: completado
- `SPRINT-9`: completado
- `SPRINT-10`: completado

## Próximos focos

1. cerrar el despliegue operativo en `ssh.getupsoft.com.do` con `sudo` no interactivo o unidad preaprobada;
2. agregar un segundo provider local o configurable para Jarvis además de `VoskSTTProvider`;
3. resolver la coherencia completa entre hints de voz y prompts de recuperación en más intents de borde;
4. persistir métricas y artefactos de entrenamiento del clasificador local;
