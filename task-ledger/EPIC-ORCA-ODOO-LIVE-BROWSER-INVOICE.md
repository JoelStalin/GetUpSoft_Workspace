# EPIC: ORCA + Odoo Live Browser — Invoice Creation E2E Flow

**Epic ID:** EPIC-ORCA-INV-001
**Date Opened:** 2026-05-31
**Date Closed:** 2026-06-01
**Status:** COMPLETE
**Owner:** Joel Stalin Martinez Espinal
**Sessions:** 16 (continuation + final)
**Commits:** 4b1e7dc754, 2cdac17347

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
| `OdooE2eRequestDto` defined | DONE | `dto/odoo-e2e-request.dto.ts` |
| Frontend `AIMode.tsx` calling `/api/orca/odoo-e2e` | DONE (pre-existing) | `AIMode.tsx:1303` |
| **Proxy fix**: `vite.config.js` → `directProxyPlugin` with `family:4` | DONE | `vite.config.js` |
| ORCA Workflow Editor running locally on port 5173 | DONE | `vite.config.js` |
| NestJS backend running locally on port 8788 with `HOST=::` | DONE | `apps/backend-nest/.env` |
| Odoo v18 instance via Docker Compose on port 8069 | DONE | `02_Odoo_ERP/.../docker-compose.yml` |
| End-to-end test: chat → factura → live browser shows result | **DONE — PASSED** | Evidence: `evidence/live-browser-test-*.png` |

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

## Test Result (PASSED — 2026-06-01)

**Command:** "factura Samsung Galaxy S25 para cliente ChefAlitas por 899"

**Odoo Invoice Created (verified via XML-RPC):**
- Invoice: **INV/2026/00067** (id=132)
- State: **posted** (validated)
- Customer: ChefAlitas (id=69, auto-created)
- Product: Samsung Galaxy S25 para (id=62, auto-created)
- Unit price: $899.00 | Total with ITBIS: **$1,033.85**
- Sale Order: id=70
- PDF: `http://127.0.0.1:8069/report/pdf/account.report_invoice/132`

**Live Browser Steps Completed (6/6):**
1. Paso 1/6 → Mostrando producto #62
2. Paso 2/6 → Mostrando cliente #69
3. Paso 3/6 → Mostrando venta #70
4. Paso 4/6 → Mostrando factura #132
5. Paso 5/6 → PDF de factura #132 descargado
6. Completado → `/web#id=132&model=account.move&view_type=form`

**How to Reproduce:**
1. Start Odoo v18: `cd 02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/odoo18 && docker compose -f docker-compose.5433.yml up -d db odoo`
2. Start NestJS: `cd apps/backend-nest && npm run start:dev` (HOST=:: in .env)
3. Start Vite: `cd apps/orca/workflow-editor && node node_modules/vite/bin/vite.js --port 5173 --host 127.0.0.1`
4. Open `http://127.0.0.1:5173` → Email Automation project → AI Mode
5. Type: "factura [producto] para [cliente] por [precio]"
6. Observe 6-step live browser animation on the canvas

**Key Technical Note — Vite Proxy (Node 24 fix):**
- `vite.config.js` must stay in sync with `vite.config.ts` (Vite loads `.js` first)
- The `directProxyPlugin` uses `http.request({ family: 4 })` to bypass Node 24 Happy Eyeballs
- Backend must use `HOST=::` (dual-stack) so both IPv4 and IPv6 loopback connections work

## Future Improvements (Next Epics)

- EPIC-ORCA-INV-002: Connect iframe to local Odoo so live browser shows the actual Odoo form
  (currently iframe shows ORCA's step-viewer because Odoo cloud URL is not accessible)
- EPIC-ORCA-INV-003: Add payment registration (register_payment) to complete the 7-step flow
- EPIC-ORCA-INV-004: Natural language parsing improvement (avoid capturing "para" as product suffix)
