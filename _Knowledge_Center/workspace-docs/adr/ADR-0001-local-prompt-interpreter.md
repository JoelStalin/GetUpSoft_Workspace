# ADR-0001: Local Prompt Interpreter

- Fecha: 2026-05-15
- Estado: accepted

## Contexto

El workspace necesita un módulo ORCA que interprete prompts escritos, scripts y audio sin consumir tokens de proveedores remotos. El repositorio ya contiene implementaciones históricas bajo `03_AI_Automation/orca`, pero esas variantes usan modelos remotos y no cumplen el nuevo requisito de operación offline.

## Decisión

Se crea un nuevo núcleo ORCA en la raíz del repositorio con:

- pipeline local determinístico;
- clasificación con `scikit-learn`;
- skills y backlog en YAML;
- salida JSON validada con Pydantic;
- wrappers offline para traducción y audio;
- separación explícita respecto al módulo legado.

## Consecuencias

### Positivas

- cumplimiento de la restricción `no AI tokens`;
- trazabilidad Scrum desde la interpretación;
- pruebas automatizadas simples y reproducibles;
- integración futura con modelos externos sin acoplamiento.

### Negativas

- coexistencia temporal de dos superficies ORCA;
- traducción y audio quedan degradables si faltan binarios o modelos locales;
- el bootstrap usa YAML/CSV antes de evolucionar a SQLite.

## Alternativas descartadas

### Extender `03_AI_Automation/orca`

Descartado porque su objetivo principal es orquestar modelos remotos y su dependencia conceptual rompería el principio offline-first.

### Usar un LLM local grande para interpretación

Descartado en esta fase porque aumentaría complejidad operativa, costo de hardware y variabilidad. El MVP prioriza reglas y ML clásico.
