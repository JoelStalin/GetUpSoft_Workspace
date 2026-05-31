# EPIC: ORCA + Odoo Live Browser — Invoice Creation E2E Flow

**Epic ID:** EPIC-ORCA-INV-001
**Date Opened:** 2026-05-31
**Status:** IN PROGRESS
**Owner:** Joel Stalin Martinez Espinal
**Sessions:** 16 (continuation)

---

## Objective

Enable the ORCA Workflow Editor to create a full invoice E2E flow in Odoo through a live browser node visible in the canvas, showing each step (product → partner → sale order → invoice → payment) in real time.

## Architecture

```
User chat: "factura iPad para Galantes por 1500"
    ↓ AIMode.tsx (invoiceIntentParser → runOdooE2ELive)
    ↓ POST /api/orca/odoo-e2e (NestJS OrcaController)
    ↓ OrcaService.runOdooE2E() → Odoo JSONRPC (product, partner, sale, invoice)
    ↓ Returns { productId, partnerId, saleOrderId, invoiceId, invoiceName, ... }
    ↓ AIMode.tsx updates OdooLiveBrowserNode iframe step-by-step
    ↓ Canvas shows live Odoo UI with each record as it is created
```

## Implementation Tasks

| Task | Status | File |
|---|---|---|
| `/api/orca/odoo-e2e` POST endpoint added to OrcaController | DONE | `orca.controller.ts` |
| `OrcaService.runOdooE2E()` method — Odoo JSONRPC integration | DONE | `orca.service.ts` |
| Odoo session auth (cookie-based for iframe) | PENDING | `orca.service.ts` |
| `OdooE2eRequestDto` defined | DONE | `dto/odoo-e2e-request.dto.ts` |
| Frontend `AIMode.tsx` calling `/api/orca/odoo-e2e` | DONE (pre-existing) | `AIMode.tsx:1303` |
| vite.config.ts proxy `/api` → `127.0.0.1:8788` | DONE | `vite.config.ts` |
| ORCA Workflow Editor running locally on port 5173 | PENDING — to test | — |
| NestJS backend running locally on port 8788 | PENDING — to verify | — |
| Odoo instance accessible (local or https://odoo.getupsoft.com) | PENDING — to verify | — |
| End-to-end test: chat → factura → live browser shows result | PENDING | — |

## Key Files

- `apps/backend-nest/src/modules/orca/orca.controller.ts` — `/api/orca/odoo-e2e` POST
- `apps/backend-nest/src/modules/orca/orca.service.ts` — `runOdooE2E()` JSONRPC
- `apps/backend-nest/src/modules/orca/dto/odoo-e2e-request.dto.ts` — request DTO
- `apps/orca/workflow-editor/src/components/modes/AIMode.tsx:1266` — `runOdooE2ELive()`
- `apps/orca/workflow-editor/src/components/OdooLiveBrowserNode.tsx` — canvas live node
- `apps/orca/workflow-editor/.env.local` — `VITE_ODOO_URL`, `VITE_ODOO_DB`, credentials

## Odoo JSONRPC API Calls Required

| Step | Model | Method | Purpose |
|---|---|---|---|
| 1 | `product.product` | `search_read` + `create` | Find or create product |
| 2 | `res.partner` | `search_read` + `create` | Find or create customer |
| 3 | `sale.order` | `create` | Create sale order |
| 4 | `sale.order.line` | `create` | Add product line to order |
| 5 | `sale.order` | `action_confirm` | Confirm sale order |
| 6 | `sale.order` | `_create_invoices` | Generate invoice from order |
| 7 | `account.move` | `action_post` | Validate (post) invoice |

## Environment Config (apps/orca/workflow-editor/.env.local)

```env
VITE_ODOO_URL=https://odoo.getupsoft.com   # or http://127.0.0.1:8069 local
VITE_ODOO_DB=odoo
VITE_ODOO_USER=admin
VITE_ODOO_PASSWORD=admin
VITE_ORCA_LIVE_API=true
VITE_API_URL=http://127.0.0.1:8788
```

## Next Steps

1. Start NestJS backend: `cd apps/backend-nest && npm run start:dev`
2. Start ORCA Workflow Editor: `cd apps/orca/workflow-editor && npm run dev`
3. Open `http://localhost:5173` → AI Mode → type: "factura iPad para Galantes por 1500"
4. Observe live browser node update in real time
5. Screenshot evidence of each step

## Known Blockers

- Odoo instance must be accessible from backend server (either local Docker or cloud odoo.getupsoft.com)
- If using cloud Odoo: backend must have network access and valid credentials
- If Odoo session cookie is needed for iframe display: `ensureOdooWebSession()` must be called first from frontend
