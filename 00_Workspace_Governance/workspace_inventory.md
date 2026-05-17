# Workspace Inventory

| Current path | Canonical name | Target domain | Worker type | Is client solution | Is GetUpSoft product | Canonical product | Status | Risk | Move allowed | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `06_E_Commerce_Lux/Galantesjewelry/` | GalantesJewelry | client-solution | — | ✅ | ❌ | — | active | medium | no | Client Solution |
| `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` | ChefAlitas | client-solution | — | ✅ | ❌ | — | active | medium | no | Client Solution localizada; existe ruta relacionada `chefalitas_repo/` como legado |
| `03_AI_Automation/local_printer_agent/` | local_printer_agent | printer_worker | printer_worker | ❌ | ❌ | — | review-needed | medium | no | Determinar qué parte es reusable y qué parte es ChefAlitas-specific |
| `03_AI_Automation/n8n/` | n8n runtime | automation_workers / workflow_runtime | workflow_runtime | ❌ | ❌ | — | active | medium | no | Workflow orchestrator |
| `03_AI_Automation/hyperframes/` | Hyperframes | ai_automation_tooling / worker_framework | candidate_worker_or_library | ❌ | ❌ | — | review-needed | medium | no | Determinar si es worker o library |
| `03_AI_Automation/notebooklm-py/` | NotebookLM py | ai_worker / library-tooling | ai_worker_or_tooling | ❌ | ❌ | — | review-needed | low | pending | Determinar uso real |
| `03_AI_Automation/orca/` | ORCA | product / worker-orchestration | orchestration_worker_platform | ❌ | ✅ | ORCA | pending | medium | no | Decisión pendiente: Product o Worker Platform |
| `orca/` | ORCA | product / worker-orchestration | orchestration_worker_platform | ❌ | ✅ | ORCA | pending | medium | no | Núcleo actual de ORCA en raíz; no mover sin audit |
| `01_Core_Platform/getupsoft-site/` | GetUpSoft Site | product | — | ❌ | ✅ | GetUpSoftSite | active | low | pending | Sitio/catálogo corporativo |
| `_Knowledge_Center/Master_Prompts/GetUpNet/` | GetUpNet | product | — | ❌ | ✅ | GetUpNet | inferred | medium | pending | Evidencia documental del producto; localizar implementación productiva exacta antes de mover |
| `01_Core_Platform/easycount-core/` | EasyCount (core) | product | — | ❌ | ✅ | EasyCount | active | high | no | Mismo producto que `Easycouting_Refactor` |
| `01_Core_Platform/Easycouting_Refactor/` | EasyCount (refactor) | product | — | ❌ | ✅ | EasyCount | active | high | no | Misma consolidación; ver nota de unificación |
| `03_AI_Automation/exo_api/` | EXO API | odoo_worker / sync_worker | sync_worker_candidate | depends | depends | — | inferred | medium | pending | Reusable si no contiene lógica de cliente; ruta exacta no confirmada en este barrido |
| `_Knowledge_Center/` | Knowledge Center | knowledge | — | ❌ | ❌ | — | active | low | no move needed | Documentación técnica centralizada |

## Nota de unificación

EasyCount y EasyCounting son el mismo producto. El nombre canónico es `EasyCount`. La carpeta `Easycouting_Refactor/` contiene una versión refactorizada del mismo producto. Ambas deben consolidarse en `02_Products/EasyCount/` en una migración futura controlada.
