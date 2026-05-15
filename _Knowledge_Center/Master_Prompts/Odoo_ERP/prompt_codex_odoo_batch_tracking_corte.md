# Optimized Prompt for Codex – Odoo 18 Batch, Tracking & Cutoff Logic

## Your Optimized Prompt

You are **GitHub Copilot / OpenAI Codex**, specialized in **Odoo 18, Python ORM, stock & delivery modules, scheduled actions, security groups, and QWeb reports**.

Your task is to **modify an existing custom Odoo module** to implement advanced **batch + tracking + cutoff-hour behavior** on top of the standard Odoo 18 codebase (`https://github.com/odoo/odoo.git`) and specifically the module **`delivery_stock_picking_batch`**.

---

### 🎯 Global Objective

Implement and integrate the following features in a clean, production-ready way:

1. **Stable main batch name (lote principal) for tracking**
2. **Tracking IDs on sale orders and sale order lines**
3. **Inventory operation tracker model**
4. **Printable report of products by batch (with serials and orders)**
5. **Buttons in batch & picking views to print that report**
6. **Cutoff-hours model, with time validation for both cron and manual blocking button**
7. **Security group for manual blocking button + views/menus to manage cutoff hours**

All of this must **reuse and extend** the existing behavior of the custom module (cron at 17:00, batch creation by shipper, EXO/fictitious product logic) without breaking it.

---

## 1. Batch main name (lote principal)

Target model: the batch picking model used by Odoo 18 and `delivery_stock_picking_batch`. In standard Odoo this is `stock.picking.batch`. Use the same model and naming from the official repo.

**Requirements:**

- Extend `stock.picking.batch` to add a field:

  - `main_batch_name` (`Char`, `copy=False`)

- On `create`:
  - If `main_batch_name` is empty, set it to the created `name`.

- On `write`:
  - **Never override** an existing `main_batch_name`.
  - If for any reason `main_batch_name` is empty after write, set it to the current `name`.

- Behavior:
  - Even if the batch name changes or the batch passes through other operations, the **main batch name remains stable** and is used in all tracking-related logic.

---

## 2. Tracking IDs on orders and products (sale order & lines)

Target models: `sale.order`, `sale.order.line`.

**On `sale.order`:**

- Add a field:
  - `tracking_id` (`Char`, `copy=False`, `index=True`, helpful description for users).

- Create an `ir.sequence` (e.g. `sale.order.tracking`) to generate values like:

  - `TRK2025-00001`

- When confirming the sale order (`action_confirm`):

  - If `tracking_id` is empty, generate it using that sequence.
  - Make sure this works correctly in multi-company environments.

**On `sale.order.line`:**

- Add a field:
  - `tracking_id` (`Char`, `copy=False`).

- When creating order lines:

  - If `tracking_id` is empty, generate something like:
    - `"<order.tracking_id>-L<line.id>"`, or
    - If the order has no tracking yet, fallback to `<order.name>-L<line.id>`.

- Goal:
  - **Every sale order** has a `tracking_id`.
  - **Every product line** of that order has its own `tracking_id`.

---

## 3. Inventory operation tracker model

Create a new model to track inventory operations at a detailed level and always reference the main batch name.

**New model:** `stock.operation.tracker`

**Fields (at least):**

- `name` (Char, reference for the operation, e.g. `"OP-<picking.name>"`)
- `batch_id` (Many2one `stock.picking.batch`)
- `batch_main_name` (Char, `related="batch_id.main_batch_name"`, `store=True`)
- `picking_id` (Many2one `stock.picking`)
- `move_line_id` (Many2one `stock.move.line`)
- `move_id` (Many2one, `related="move_line_id.move_id"`, `store=True`)
- `product_id` (Many2one `product.product`, `related="move_line_id.product_id"`, `store=True`)
- `lot_id` (Many2one `stock.lot`, `related="move_line_id.lot_id"`, `store=True`)
- `order_id` (Many2one `sale.order`)
- `order_tracking_id` (Char)
- `line_tracking_id` (Char)
- `operation_type_id` (Many2one `stock.picking.type`)
- `operation_state` (Selection using picking states: `draft`, `waiting`, `confirmed`, `assigned`, `done`, `cancel`)
- `qty_done` (Float)
- `date` (Datetime, default to `fields.Datetime.now()`)

Set `_order = "date desc, id desc"`.

### Hook into inventory operations

Target model: `stock.picking`.

- Extend `stock.picking.action_done()`:

  - After calling `super().action_done()`, call a helper method such as `_create_inventory_tracker_entries()`.

- Helper `_create_inventory_tracker_entries()`:

  For each `picking` in `self`:

  - Get the batch: `picking.batch_id` (or the correct field used by `delivery_stock_picking_batch`).
  - For each `move_line` in `picking.move_line_ids`:

    - Get the `sale.order.line` (if any) via `move_line.move_id.sale_line_id`.
    - Get the `sale.order` (`order = sale_line.order_id`).
    - Ensure the order has a `tracking_id` (call the generation method if necessary).
    - Get the line tracking ID from the sale line.

    - Create a `stock.operation.tracker` entry with:

      - `name`: e.g. `f"OP-{picking.name}"`
      - `batch_id`: batch
      - `picking_id`: the picking
      - `move_line_id`: the move line
      - `order_id`: the sale order
      - `order_tracking_id`: `order.tracking_id`
      - `line_tracking_id`: sale line tracking ID
      - `operation_type_id`: `picking.picking_type_id`
      - `operation_state`: `picking.state`
      - `qty_done`: `move_line.qty_done`
      - `date`: current datetime

- Requirement:
  - **Every inventory operation** that completes (`action_done`) on pickings tied to batches/orders must generate tracker entries.
  - The tracker must **always carry the main batch name** (via the related field).

---

## 4. Printable report of products by batch

Create a QWeb PDF report that lists all products in a batch, along with serials and related orders.

**Report characteristics:**

- Base model: `stock.picking.batch`.
- Use QWeb with `ir.actions.report` (`report_type="qweb-pdf"`).
- Template should iterate over each batch in `docs`.

For each batch:

- Show:
  - Batch **main name** (primary) and current `name` (for reference).

- Collect all `stock.picking` records: `doc.picking_ids`.

- For each `stock.move.line` in those pickings:

  - Show columns like:
    - Batch main name
    - Picking name
    - Order name (`sale.order`)
    - Order tracking ID
    - Product name (`product_id.display_name`)
    - Quantity (`qty_done` or `product_uom_qty`) and UoM
    - Lot/Serial number: `lot_id.name` or `lot_name`

This report will be used as the **batch products/serials/ordering printout**.

---

## 5. Buttons in batch & picking views to print the report

### On `stock.picking.batch` form

- Extend the existing batch form view provided by the Odoo stock/batch modules (`delivery_stock_picking_batch` / `stock_picking_batch`).
- In the `<header>` section, add a button:

  - Label: **"Imprimir productos del lote"**
  - Type: `action`
  - `name`: reference the `ir.actions.report` created above via `%(xml_id_of_report)d`.
  - `class="btn-secondary"`

### On `stock.picking` form

- Extend the standard picking form (`stock.view_picking_form`).
- In the `<header>`:

  - Add a button:

    - Label: **"Imprimir productos del lote"**
    - Type: `object`
    - Name: `action_print_batch_products`
    - `class="btn-secondary"`
    - `attrs="{'invisible': [('batch_id', '=', False)]}"` so it only shows if the picking belongs to a batch.

- Implement `action_print_batch_products` in `stock.picking`:

  - If `self.batch_id` exists, call the batch report action for that batch.
  - If no batch is found (fallback scenario), either:
    - Call the same report but on this picking only, or
    - Raise a friendly `UserError`. Prefer reusing the batch report.

---

## 6. Cutoff-hours model + time validation (job + manual button)

You must add a **dedicated model for cutoff hours**, and both the **scheduled job (cron)** and the **manual blocking button** must validate that the **current execution time matches a configured cutoff hour**.

### 6.1 New model for cutoff hours

Create a model, e.g. `company.cutoff.hour` (you may choose a suitable technical name):

Fields:

- `name` (Char): Short label (e.g. `"Corte 5PM"`).
- `company_id` (Many2one `res.company`, required=True, ondelete="cascade").
- `cutoff_time` (Float or a Time-type representation):
  - Represented as hour in decimal (e.g. 17.0 = 17:00, 17.5 = 17:30) or as a proper `fields.Float` with a help text explaining format.
- `active` (Boolean, default=True).
- Optional:
  - `weekday` (Selection or Integer) if you want day-specific cutoffs (not mandatory unless you want it).
  - `description` (Text) for admin notes.

Behavior:

- This model is used to define **one or more cutoff hours per company**.
- Admin and an authorized group must be able to **create and manage** these records via views/menus (see section 7).

### 6.2 Validation logic for manual blocking button

Existing behavior:

- There is already a manual **block orders** button (on `res.company`) named something like `action_block_orders_by_cutoff()` that:
  - Finds orders in a specific state (e.g. `"Aprobado por SAP"`).
  - Blocks them and possibly creates batches grouped by shipper.
  - Previously might have checked a simple `cutoff_hour` float field.

New behavior:

- Replace or enhance that logic so that:

  - When the button is pressed, the method **first checks the current time** (in server timezone or, preferably, in the company/user timezone) **against the configured cutoff hours** (`company.cutoff.hour` records for that company).

  - Only proceed to block the orders if there is at least one active cutoff-hour record such that the current time **matches the cutoff hour**.

  - Define “matches” as:
    - At minimum, same hour (rounded) as `cutoff_time`, or
    - Same hour and minute if you choose a more precise implementation.
    - Be explicit and consistent in the code.

- If the time **does not match** any active cutoff hour for that company:

  - Do **not** block orders.
  - Raise a `UserError` with a clear, user-friendly message, e.g.
    - `"La hora actual no coincide con ninguna hora de corte configurada para esta compañía."`

- The manual button must therefore:
  - Check cutoff-hours model first.
  - Only proceed with blocking + batch creation when validation passes.

### 6.3 Validation logic for the scheduled job (cron)

Existing behavior:

- There is a cron job (scheduled action) that runs every day at 17:00 (or similar) to block orders automatically.

New behavior:

- The cron must **also** validate that its actual runtime **matches a configured cutoff hour** for each company.

Implementation details:

- The cron model is `ir.cron` running on `res.company` (e.g. `model.cron_block_orders_daily()`).
- In the cron method (e.g. `cron_block_orders_daily`):

  For each company with cutoff/blocking enabled:

  - Check the current execution time (again, server or company timezone) against that company’s active `company.cutoff.hour` records.

  - If the time **matches** at least one configured cutoff hour:

    - Call the same logic internally used by the manual button to block orders and create batches (e.g. reuse `action_block_orders_by_cutoff()` or a shared internal method).

  - If the time **does NOT match** any cutoff hour for that company:

    - Do **nothing** for that company (no blocking, no error).
    - Optionally log a debug/info message, but **do not raise** an exception, so cron continues working.

- Result:
  - Both the **manual button** and the **cron job** are now governed by the same cutoff-hour configuration model.
  - Blocking only occurs when the execution time aligns with a stored cutoff-hour record.

---

## 7. Security group & views for cutoff hours

### 7.1 Security group for the manual blocking button

Create a new security group, e.g.:

- XML ID: `odoo_exo_ficticio.group_cutoff_block_orders`
- Name: `"Corte de pedidos (bloqueo manual)"`

Requirements:

- Only users in this group **and** the **system administrator** (`base.group_system`) can see and use the manual blocking button.

Implementation:

- In the form view where the manual button is defined (likely `res.company` form):

  - Add `groups="odoo_exo_ficticio.group_cutoff_block_orders,base.group_system"` attribute on the `<button>` element.

- Define the group in a security XML file (e.g. `security/ir.model.access.csv` and/or `security/security.xml`), and add it to the manifest.

- Make sure access rights to models like `company.cutoff.hour` and `stock.operation.tracker` are set appropriately:
  - Admin: full permissions.
  - The new cutoff group: at least read/create/write on the cutoff model.

### 7.2 Views & menus for managing cutoff hours

Create views for the cutoff-hours model:

- Tree (list) view.
- Form view.

Fields to show:

- `name`
- `company_id`
- `cutoff_time`
- `active`
- Optional: `description`, `weekday` if implemented.

Create an action & menu item so that **admin and the cutoff group** can manage these records:

- Action model: `ir.actions.act_window` for `company.cutoff.hour`.
- Menu suggested path:
  - Could be under **Settings → Technical**, or under **Inventory / Stock → Configuration** depending on your design.
- Restrict the menu and action with:
  - `groups="base.group_system,odoo_exo_ficticio.group_cutoff_block_orders"`

This way:

- Only admin and users in the custom group can configure cutoff hours.
- Cutoff hours are maintained via a standard Odoo UI.

---

## 8. Compatibility & Existing Behavior

The custom module already includes:

- A **cron job** at 17:00 that blocks orders in a certain state (e.g. `"Aprobado por SAP"`).
- Logic that **creates batches grouped by shipper** based on `stock.picking.batch` and related modules.
- Logic related to **EXO** integration and a **fictitious product** per order (this logic is already in place and should remain intact).

Your changes must:

- **Not break** existing features.
- Reuse the existing methods and extend them where possible:
  - For blocking orders, reuse/enhance `action_block_orders_by_cutoff()` and `cron_block_orders_daily()`.
  - For batch creation, continue using `stock.picking.batch` and the relations that `delivery_stock_picking_batch` expects.
- Keep everything ORM-only:
  - No raw SQL.
  - Respect multi-company rules where relevant.

---

## 9. Technical Constraints & Coding Style

- Target version: **Odoo 18**.
- Use standard Odoo patterns:
  - `models.Model`, `fields`, `api` decorators.
  - `@api.model`, `@api.depends`, etc. where necessary.
- No raw SQL.
- Keep code PEP8-compliant where possible.
- Use inline comments to explain non-trivial logic:
  - Especially around cutoff-hour validation, tracker creation, and multi-company handling.
- View definitions:
  - Use `inherit_id` and `<xpath>` to extend existing views.
- Reports:
  - Use `ir.actions.report` with `report_type="qweb-pdf"` and a matching QWeb template ID.

---

## 10. Files & Output Structure Expected from You (Codex)

You are working inside an existing custom addon (e.g. `custom-addons/odoo_exo_ficticio/`) that already has:

- A `__manifest__.py`.
- Models extending:
  - `res.company` (for cron/cutoff logic).
  - `sale.order` / `sale.order.line` (for EXO/fictitious product).
  - `stock.picking.batch` (for shipper grouping).
- Some views and security definitions.

**You must produce:**

1. **Python code** (ready-to-paste), grouped by file path:
   - `models/stock_picking_batch.py` (or equivalent) with `main_batch_name` logic.
   - `models/sale_order.py` with `tracking_id` logic (order + lines).
   - `models/stock_operation_tracker.py` (new model).
   - `models/stock_picking.py` with:
     - `_create_inventory_tracker_entries()` and overridden `action_done()`.
     - `action_print_batch_products()` method.
   - `models/company_cutoff_hour.py` (or similar name) with the cutoff-hours model.
   - Updated `res.company` extension file with:
     - Manual blocking method validating time against cutoff-hours model.
     - Cron method validating time against cutoff-hours model before blocking.

2. **XML code**, grouped by file path:
   - `data/seq_sale_order_tracking.xml` (sequence for `sale.order.tracking_id`).
   - `report/report_stock_batch_products.xml`:
     - `ir.actions.report` definition.
     - QWeb template definition.
   - `views/stock_picking_batch_views.xml`:
     - Button in batch view header for printing products of the batch.
   - `views/stock_picking_views.xml`:
     - Button in picking view header for printing batch products.
   - `views/company_cutoff_hour_views.xml`:
     - Tree/form views and action/menu for cutoff-hours.
   - `security/security.xml`:
     - Group definition `group_cutoff_block_orders`.
   - `security/ir.model.access.csv`:
     - Proper access rights for:
       - `stock.operation.tracker`
       - `company.cutoff.hour`
       - Any other new model, giving admin full rights and the custom group appropriate rights.

3. **Updated `__manifest__.py`**:
   - Includes `delivery_stock_picking_batch` in `depends`.
   - Includes new XML files in the `data` (and `security`) sections.

4. **Short explanation comments** in the code to clarify:
   - Where the cutoff-hour check is done in both manual button and cron.
   - How the tracker entries link batches, orders, and products.
   - How the report is triggered from batch and picking.

---

## Key Improvements

- Deconstructed the requirements into **clear, modular features**:
  - Batch main name, tracking IDs, tracker model, report, UI buttons, cutoff model, and security.
- Made all time-based behavior explicit and centralized via a **cutoff-hours model**, shared by both cron and manual actions.
- Introduced a security group and restricted views/buttons so only **admin + specific group** can execute sensitive operations.
- Specified exact models, methods, and file structure so Codex can output **ready-to-paste Odoo code** instead of vague snippets.

---

## Techniques Applied

- **4-D Methodology**:
  - *Deconstruct*: Split the original request into discrete technical features.
  - *Diagnose*: Identified where extra structure was needed (cutoff model, security, views).
  - *Develop*: Designed a coherent implementation plan using Odoo best practices (ORM, QWeb, security, cron).
  - *Deliver*: Structured the prompt into objectives, requirements, constraints, and expected outputs.
- **Constraint-based prompting** for technical accuracy.
- **Role assignment** (Codex as Odoo 18 backend & framework expert).
- **Structured output specification** to minimize ambiguity.

---

## Pro Tip for Using This Prompt

- Paste this entire prompt into **GitHub Copilot Chat or Codex** within your Odoo project (root of your custom addon).
- Run it file-by-file if needed (e.g. “Generate `models/company_cutoff_hour.py` according to the prompt”).
- Always:
  - Verify final model names (`stock.picking.batch`, `batch_id`) and XML `inherit_id` references against your exact Odoo 18 version.
  - Adjust menu locations if you prefer `Inventory` instead of `Settings`.
  - Test the cron and manual button in a staging database before deploying to production.

