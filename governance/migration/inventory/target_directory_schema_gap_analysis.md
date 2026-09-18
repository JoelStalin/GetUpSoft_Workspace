# Gap analysis: esquema de directorios acordado vs. estado real

**Fecha:** 2026-09-18
**Origen del esquema objetivo:** acuerdo directo del usuario (pegado en conversación, coincide con las referencias ya existentes en el repo a "diseño integral sección 2.2" citadas en `.gitignore` y `governance/migration/`).
**Estado:** el esquema objetivo NO está implementado. Esta es la primera vez que se registra formalmente el gap completo.

## Esquema objetivo (acordado)

```
GetUpSoft_Workspace/
├── AGENTS.md / README.md / workspace.json / workspace.lock.json / bootstrap.ps1 / bootstrap.sh
├── governance/{registry,profiles,contracts,policies,migration,delivery}/
├── platform/{orca,client-gateway}/        # únicos repos independientes permitidos
├── products/{getupsoft-site,easycount,chefalitas,getupnet,smartdoor,boat}/
├── client-solutions/{galantes-jewelry,customer-overlays}/
├── workers/{printing,documents,data,browser,ai}/
├── integrations/{odoo/{shared-addons/v15..v19,connectors,compatibility},n8n}/
├── libraries/{internal,third-party}/
├── infrastructure/{compose,hosts,networking,observability,backup,mail}/
├── tools/{workspace-cli,inventory,migration,verification}/
├── _Knowledge_Center/{corporate,architecture,projects,runbooks,prompts,glossary,history}/
├── labs/
├── archives/{source,provenance}/
├── .runtime/ (fuera de git) {bootstrap,data,artifacts,logs,models,backups,recovery}/
└── .agents/ .codex/ .claude/ .hermes/ .github/
```

## Estado real de la raíz (verificado con `ls -d */`, 2026-09-18)

```
00_Workspace_Governance/  01_Core_Platform/  02_Odoo_ERP/  02_Products/
03_AI_Automation/  03_Client_Solutions/  04_Workers/  05_Backups/
06_E_Commerce_Lux/  06_Infrastructure_Networking/  07_Libraries_Tools/
08_Research_Labs/  09_Archives/  _Knowledge_Center/  apps/  archives/
client-solutions/  data/  docs/  governance/  graphify-out/  historicos/
infra/  integrations/  labs/  libraries/  platform/  scripts/  services/
task-ledger/  temp-deploy-clone/  temp_venv/  tmp/  tools/
```

## Comparación carpeta por carpeta

| Objetivo | Estado real | Gap |
|---|---|---|
| `governance/` | Existe, coincide en subcarpetas (`registry/`, `migration/`) | ✅ Ya migrado |
| `platform/{orca,client-gateway}` | `platform/` existe pero contenido no confirmado; `orca` real vive en `apps/orca/` y `services/orca/` (duplicado) | ⚠️ Duplicación sin resolver, no migrado |
| `products/{getupsoft-site,easycount,chefalitas,getupnet,smartdoor,boat}` | No existe `products/`. Contenido disperso en `apps/`, `02_Products/`, `06_E_Commerce_Lux/`, `services/easycount/` | ❌ Pendiente completo |
| `client-solutions/{galantes-jewelry,customer-overlays}` | `client-solutions/` existe pero `galantes-jewelry` real vive en `apps/galantes-jewelry/` (checkout independiente, ver `.gitignore`); `03_Client_Solutions/` legacy sin migrar | ⚠️ Carpeta creada, contenido no movido |
| `workers/{printing,documents,data,browser,ai}` | No existe. `04_Workers/` legacy sin migrar | ❌ Pendiente completo |
| `integrations/odoo/{shared-addons/v15-19,connectors,compatibility}` | `integrations/odoo/shared-addons/{v16,v17,v18}` existe (gitignored, checkouts terceros); falta v15/v19, `connectors/`, `compatibility/`. `02_Odoo_ERP/` legacy sin migrar | ⚠️ Parcial |
| `libraries/{internal,third-party}` | `libraries/third-party/` existe; falta `libraries/internal/`. `07_Libraries_Tools/` legacy sin migrar | ⚠️ Parcial |
| `infrastructure/{compose,hosts,networking,observability,backup,mail}` | No existe `infrastructure/`. Hay `infra/` (solo nginx) y `06_Infrastructure_Networking/` legacy | ❌ Pendiente completo, naming distinto |
| `tools/{workspace-cli,inventory,migration,verification}` | `tools/` existe pero subcarpetas no confirmadas | ⚠️ Verificar contenido |
| `_Knowledge_Center/{corporate,architecture,projects,runbooks,prompts,glossary,history}` | Existe con `history/`, `Master_Prompts/` — nombres no coinciden exactamente (`Master_Prompts` vs `prompts`) | ⚠️ Parcial, naming distinto |
| `labs/` | Existe | ✅ Ya migrado |
| `archives/{source,provenance}` | `archives/source/` existe (gitignored); falta `provenance/`. `09_Archives/` legacy sin migrar | ⚠️ Parcial |
| `.runtime/` (fuera de git) | No existe como raíz única. Solo referenciado en plan pendiente (`platform/orca/.runtime/data/`) y ya está en `.gitignore` como patrón | ❌ Pendiente completo |
| 13 carpetas numeradas legacy (`00_`–`09_`) | Todas siguen presentes en la raíz | ❌ Nunca se eliminaron/migraron |
| `03_AI_Automation/`, `05_Backups/` | Gitignored, contenido "superseded" según nota existente | ⚠️ Candidatas a borrado tras confirmar que nada útil queda |
| `apps/`, `data/`, `docs/`, `graphify-out/`, `temp-deploy-clone/`, `temp_venv/`, `tmp/` | No están en el esquema objetivo en absoluto | ❌ Sin destino asignado — decisión pendiente del usuario |

## Por qué no se ha ejecutado

Ningún commit hasta la fecha mueve contenido de las 13 carpetas numeradas legacy, ni crea `products/`, `workers/`, `infrastructure/`, ni consolida el `platform/orca` vs `apps/orca` vs `services/orca` (triplicado). Los commits de reorg previos (R01/R02) solo tocaron `docs/` → `_Knowledge_Center/history/` y actualizaron 8 registros de catálogo — un subconjunto pequeño del acuerdo completo.

## Riesgo de ejecutar la migración completa sin confirmación explícita

- Volumen alto: `apps/orca` y `services/orca` parecen ser el mismo proyecto duplicado — mover sin confirmar cuál es la fuente de verdad puede destruir trabajo.
- `apps/getupnet/` y `apps/galantes-jewelry/` son checkouts independientes con su propio `.git`/remote — moverlos de carpeta es seguro (son directorios normales en disco), pero antes hay que decidir su nueva ruta exacta bajo `products/`/`client-solutions/` y actualizar `.gitignore`, `docker-compose.yml`, `.github/workflows/deploy.yml` y `governance/registry/projects/*.json` en el mismo commit para no romper CI/deploy.
- `.runtime/` como raíz nueva fuera de git requiere mover `data/`, artefactos y logs dispersos hoy en `05_Backups/`, `task-ledger/evidence/`, `.claude/`, etc. — alto volumen, bajo riesgo de pérdida si se usa `git mv`/`mv` (no `rm`), pero requiere script, no movimientos manuales uno por uno.

## Próximo paso propuesto (seguro, bajo riesgo, ejecutable ya)

1. Crear `products/`, `workers/`, `infrastructure/` vacíos con `.gitkeep` y un `README.md` por carpeta explicando su propósito (movimiento de contenido real queda para pasos siguientes, uno por subsistema, cada uno confirmado por CI/tests antes del próximo).
2. Resolver primero la duplicación `apps/orca/` vs `services/orca/` vs `platform/orca/` — investigar diffs entre los tres antes de mover nada, porque ahí sí hay riesgo real de pérdida de trabajo si se elige mal la fuente de verdad.
