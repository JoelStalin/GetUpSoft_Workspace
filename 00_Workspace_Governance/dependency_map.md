# Dependency Map

## Reglas

```text
Client Solution  -> may depend on Products
Client Solution  -> may depend on Workers
Client Solution  -> may depend on ERP/Odoo
Product          -> may depend on Workers
Product          -> may depend on Shared Libraries
Worker           -> may depend on Shared Libraries
Worker           -> must NOT depend on Client Solution
Shared Library   -> must NOT depend on Product or Client Solution
Knowledge Center -> documents all domains; must NOT contain production secrets
EasyCount        -> single canonical product; easycount-core + Easycouting_Refactor are the same product
```

## Ejemplos

```text
GalantesJewelry  -> scraping_worker / catalog_worker / reporting_worker / payment_worker
ChefAlitas       -> Odoo_worker / POS_worker / printer_worker / e-CF_worker
GetUpNet         -> payment_worker / Odoo_worker / networking_worker
AIHub            -> ai_routing_worker / prompt_preprocessing_worker / audit_worker
ORCA             -> prompt_interpreter_worker / workflow_worker / orchestration_worker
EXO              -> Odoo_sync_worker / accounting_worker
EasyCount        -> e-CF_worker / Odoo_sync_worker / document_generation_worker / reporting_worker
```

## Observaciones del workspace actual

- `local_printer_agent` muestra acoplamiento explícito con `Chefalitas`; requiere extracción para quedar como worker genérico.
- `n8n`, `hyperframes` y `notebooklm-py` son candidatos a workers o tooling, pero aún necesitan auditoría funcional.
- `ORCA` aparece en dos ubicaciones conceptuales (`orca/` y `03_AI_Automation/orca/`), lo que exige un mapa de consolidación antes de mover.
