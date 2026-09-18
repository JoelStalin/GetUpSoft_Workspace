# GetUpSoft Workspace

## Workspace architecture

GetUpSoft_Workspace follows a worker-first workspace architecture.

Reusable technical components should behave as workers with explicit contracts.
Products and client solutions consume those workers.

Client solutions such as GalantesJewelry and ChefAlitas are products built by GetUpSoft
for external clients, not generic internal GetUpSoft products.

EasyCount and EasyCounting are the same GetUpSoft product. The canonical name is EasyCount.
Both folders (`easycount-core/` and `Easycouting_Refactor/`) will be consolidated under
`02_Products/EasyCount/` in a future controlled migration.

The repository is organized conceptually into:

- Workspace Governance
- Business Admin
- Products (GetUpNet, EasyCount, ORCA, AIHub, GetUpSoftSite)
- Client Solutions (GalantesJewelry, ChefAlitas, EXO)
- Workers
- ERP/Odoo
- AI Automation
- Infrastructure/Networking
- Libraries/Tools
- Research/Labs
- Archives
- Knowledge Center

For directory rules, see:

- `WORKSPACE_MAP.md`
- `00_Workspace_Governance/directory_rules.md`
- `00_Workspace_Governance/migration_manifest.md`
- `_Knowledge_Center/Architecture/WORKER_FIRST_ARCHITECTURE.md`

Este repositorio ahora define una nueva base de trabajo para `ORCA Backlog + Prompt Interpreter`, separada del módulo histórico `03_AI_Automation/orca`.

## ORCA

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
orca interpret "arregla el bug del login y agrega pruebas"
```

5. Levantar el servicio HTTP local:

```powershell
uvicorn --factory orca.service.app:create_app --host 127.0.0.1 --port 8787
```

6. Desplegar por SSH al host operativo:

```powershell
./scripts/deploy_orca_service.ps1
```

7. Procesar un comando Jarvis ya transcrito:

```powershell
orca jarvis transcript "Jarvis arregla el bug del login y crea pruebas"
```

8. Procesar un `audio_ref` con provider mock:

```powershell
orca jarvis audio sample_bug.wav --provider mock
```

9. Procesar audio con provider Vosk local:

```powershell
orca jarvis audio .\sample.wav --provider vosk
```

10. Guardar y consultar historial local de Jarvis:

```powershell
orca jarvis transcript "Jarvis crea tarea para backlog" --store-history
orca jarvis history list --limit 5
orca jarvis history clear
```

11. Explorar la CLI reorganizada:

```powershell
orca doctor
orca prompt text "arregla el bug del login"
orca backlog status
orca skills list
orca service health
```

## Estructura funcional

- `docs/`: visión, arquitectura, ADRs, investigación y proceso Scrum.
- `orca/`: núcleo offline, backlog YAML, skills YAML, traducción, audio y ML local.
- `tests/`: pruebas unitarias del MVP.
- `.github/`: plantillas ágiles y CI.
- `deploy/`: automatización de instalación y unidad `systemd`.

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
- [ADR 0003](docs/adr/ADR-0003-opentypeless-inspired-jarvis-pipeline.md)
- [OpenTypeless Jarvis Integration](docs/integrations/opentypeless-jarvis-integration.md)
- [CLI Redesign Notes](docs/research/orca-cli-redesign-from-rebuild.md)
