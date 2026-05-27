# Odoo E2E + n8n Automation Result

Fecha: 2026-05-25

## Estado

- Flujo E2E ejecutado: **OK**
- Factura creada/publicada: **OK**
- Pago registrado: **OK**
- Estado final factura: **paid**
- PDF descargado: **OK**
- Evidencia UI (screenshot + video): **OK**

## Evidencia principal

- Resultado JSON:
  - `task-ledger/evidence/odoo-invoice-e2e/odoo-e2e-result.json`
- PDF factura:
  - `C:\Users\yoeli\Downloads\odoo-invoice-6-20260525-101734.pdf`
- Screenshot UI:
  - `C:\Users\yoeli\Downloads\orca-odoo-evidence\odoo-ui-evidence-1779718717585.png`
- Video UI:
  - `C:\Users\yoeli\Downloads\orca-odoo-evidence-1779718718721.webm`

## Workflow n8n reusable

- Archivo workflow:
  - `task-ledger/workflows/n8n/orca-odoo-invoice-e2e.workflow.json`

## Scripts implementados

- Flujo Odoo end-to-end:
  - `scripts/odoo_invoice_e2e.py`
- Captura UI con video:
  - `scripts/odoo_ui_evidence_video.mjs`
- Orquestador y monitoreo:
  - `scripts/run_orca_odoo_invoice_task.ps1`

