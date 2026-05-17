# Migration Manifest

| Date | Current path | Target path | Type | Risk | Status | Commit | Notes |
|---|---|---|---|---|---|---|---|
| 2026-05-17 | `README.md` | `README.md` (update section) | doc | low | pending | — | Agregar sección workspace architecture |
| 2026-05-17 | `orca/` | `02_Products/ORCA/` | product | medium | pending | — | Verificar imports y refs internas |
| 2026-05-17 | `docs/` | `00_Workspace_Governance/` o `_Knowledge_Center/` | doc | low | pending | — | Clasificar por contenido |
| 2026-05-17 | `03_AI_Automation/orca/` | `02_Products/ORCA/` | product | medium | do not move yet | — | Requiere audit de rutas |
| 2026-05-17 | `01_Core_Platform/easycount-core/` | `02_Products/EasyCount/` | product | high | pending — requires dependency audit | — | Parte de EasyCount canónico |
| 2026-05-17 | `01_Core_Platform/Easycouting_Refactor/` | `02_Products/EasyCount/` | product | high | pending — requires dependency audit | — | Parte de EasyCount canónico — misma consolidación |
| 2026-05-17 | `02_Odoo_ERP/` | `05_ERP_Odoo/` | erp | high | do not move yet | — | Odoo: rutas internas críticas |
| 2026-05-17 | `03_AI_Automation/n8n/` | `04_Workers/` o mantener | worker-runtime | medium | do not move yet | — | Requiere audit de workflows |
| 2026-05-17 | `03_AI_Automation/hyperframes/` | `04_Workers/` o `07_Libraries_Tools/` | ai-tooling | medium | do not move yet | — | Determinar si es worker o library |
| 2026-05-17 | `03_AI_Automation/notebooklm-py/` | `04_Workers/ai_workers/` o `07_Libraries_Tools/` | ai-worker | low | pending | — | Determinar uso real |
| 2026-05-17 | `03_AI_Automation/local_printer_agent/` | `04_Workers/printer_workers/` | printer-worker | medium | do not move yet | — | Verificar si es client-specific |
| 2026-05-17 | `06_E_Commerce_Lux/Galantesjewelry/` | `03_Client_Solutions/GalantesJewelry/` | client-solution | medium | do not move yet | — | Client Solution activa: no mover sin card |
| 2026-05-17 | `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` | `03_Client_Solutions/ChefAlitas/` | client-solution | medium | do not move yet | — | Client Solution activa localizada; revisar también `chefalitas_repo/` legado |
| 2026-05-17 | `_Knowledge_Center/` | `_Knowledge_Center/` (mantener) | knowledge | low | no move needed | — | Mantener en raíz |
