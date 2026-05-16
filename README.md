# GetUpSoft Workspace

Este repositorio ahora define una nueva base de trabajo para `ORCA Backlog + Prompt Interpreter`, separada del módulo histórico `03_AI_Automation/orca`.

## Propósito

ORCA es un intérprete local de prompts y artefactos de trabajo que:

- normaliza texto desordenado sin usar LLMs remotos;
- clasifica intención con ML clásico local;
- enruta skills configurables en YAML;
- mapea solicitudes a backlog Scrum;
- genera prompts optimizados para modelos externos;
- genera prompts de recuperación para que modelos gratuitos continúen trabajos fallidos;
- mantiene el núcleo operativo offline.

## Decisión de alcance

El repositorio contiene implementaciones históricas que usan proveedores remotos. Esa superficie no se modifica en este bootstrap. La nueva base ORCA se implementa en la raíz del repo con esta estructura:

```text
docs/
orca/
tests/
.github/
pyproject.toml
```

## Estado inicial

- `SPRINT 0` cubre documentación, arquitectura, backlog, CI y contratos base.
- `SPRINT 1` cubre el MVP del intérprete local de prompts.
- `SPRINT 2+` quedan preparados mediante scaffolding para ML persistente, traducción offline avanzada, audio Jarvis y recuperación de errores.

## Uso rápido

1. Crear entorno virtual.
2. Instalar dependencias:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .[dev]
```

3. Ejecutar pruebas:

```powershell
pytest
```

4. Interpretar un prompt:

```powershell
orca interpret --text "arregla el bug del login y agrega pruebas"
```

## Estructura funcional

- `docs/`: visión, arquitectura, ADRs, investigación y proceso Scrum.
- `orca/`: núcleo offline, backlog YAML, skills YAML, traducción, audio y ML local.
- `tests/`: pruebas unitarias del MVP.
- `.github/`: plantillas ágiles y CI.

## Restricciones del intérprete local

- No usa OpenAI, Anthropic, Gemini ni ningún LLM remoto para interpretar prompts.
- No consume tokens de IA para clasificación o normalización.
- La integración futura con modelos externos solo consume prompts ya normalizados por ORCA.

## Política de ejecución autónoma

- ORCA debe avanzar por defecto sin pedir confirmaciones innecesarias.
- Si existe una suposición razonable y de bajo riesgo, ORCA debe continuar.
- Una tarea no se considera terminada hasta cerrar código, pruebas, documentación y backlog.
- Solo debe detenerse por bloqueos reales: permisos faltantes, ambigüedad destructiva o riesgo inseguro.

## Referencias

- [Vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Scrum Process](docs/scrum-process.md)
- [Prompt Routing](docs/prompt-routing.md)
- [ADR 0001](docs/adr/ADR-0001-local-prompt-interpreter.md)
