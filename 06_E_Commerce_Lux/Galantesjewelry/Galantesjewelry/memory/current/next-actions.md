# Next Actions - Galantes Jewelry Implementation

## Immediate
0. **Start GetUpSoft + EasyCount transformation backlog**
   - `GUS-001` through `GUS-005` and `GUS-007` through `GUS-031` now have local/GitHub evidence in `task-ledger/tasks.json`
   - Finish `GUS-006` after receiving a valid Cloudflare token for `getupsoft.com` and `getupsoft.com.do`
   - Finish `GUS-017` after receiving final GitHub/Cloudflare/deployment secret values
   - Corporate portal is already live; current workspace verification succeeded for `https://getupsoft.com.do`
   - Shared-host nginx on `ssh.getupsoft.com.do` is now router-ready for `getupsoft.com`, `admin.getupsoft.com`, and `easycount.getupsoft.com` after a targeted reload of `server-nginx-1`
   - Use `docs/getupsoft-easycount-transformation-roadmap.md` as the readable roadmap
   - Use `task-ledger/tasks.json` phase `GUS_EASYCNT` as the canonical task state

1. **Promote the Odoo addon change**
   - Upgrade `galantes_jewelry` in the target Odoo 19 database
   - Validate from a real phone that product gallery uploads now succeed with the raised `4096x4096` cap
   - Load the replacement inventory into Odoo now that the storefront catalog is empty
   - Keep the new Odoo accounting baseline under watch now that the US chart of accounts and journals were loaded directly on production
   - Confirm `galante.appointment/create_from_api` responds through JSON-2 with real credentials
   - Keep the storefront host routing under watch now that `shop.galantesjewelry.com` serves the Next.js PDPs
   - Keep the new destination-based tax calculation and cart thumbnail fallback under watch after the latest checkout fix
   - Use `npm run test:e2e:production` as the default production smoke entrypoint before and after each deploy

2. **Run live integration validation**
   - Save the real Odoo API key and database values
   - Exercise `/api/contact` or `/api/v1/appointments` against live Odoo and Google
   - Verify `odooAppointmentId` is returned and visible in Odoo
   - Reproduce and fix the public Next.js checkout -> Odoo order-creation failure so the live storefront payment route matches the now-validated manual Odoo billing/refund path
   - Add a guarded production regression that covers invoice creation, paid reconciliation, and refund/credit-note handling for a temporary QA order
   - Use the guarded flags in `tests/e2e/production_suite.py` when the validation must include real appointment send, authenticated account portal, or live checkout payment coverage

3. **Tighten observability**
   - Expose Odoo sync details in admin views if needed
   - Decide whether Odoo sync failures should trigger alerts or retries
   - Review the production admin schedule values for booking window start/end, interval, and weekdays

## Short Term
1. Add retry/alert handling for failed Odoo syncs if the business wants stronger guarantees
2. Add admin filtering/reporting by `odooSyncStatus`
3. Add a dedicated regression case for a real Odoo 401/404 response once credentials are present

## Dependencies
- Google Calendar and email flow are already working
- Odoo 19 JSON-2 requires bearer/API-key auth and database selection
- Odoo credentials must be present before live sync can be enabled

## Priority Order
1. Odoo sync service
2. Appointment API integration
3. Functional tests
4. Odoo module-side transaction helper if needed
5. Documentation refresh
