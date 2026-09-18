import json

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class InvoiceServiceTypeDetail(models.Model):
    """Almacena los detalles de servicios."""
    _name = "invoice.service.type.detail"
    _description = "Invoice Service Type Detail"

    name = fields.Char()
    code = fields.Char(size=2)
    parent_code = fields.Char()

    _sql_constraints = [
        ("code_unique", "unique(code)", _("Code must be unique")),
    ]


class AccountMove(models.Model):
    """Agregar logica para el reporte DGII."""
    _inherit = "account.move"

    # 606
    service_total_amount = fields.Monetary(
        compute="_compute_amount_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    good_total_amount = fields.Monetary(
        compute="_compute_amount_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )

    invoiced_itbis = fields.Monetary(
        compute="_compute_invoiced_itbis",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )

    withholded_itbis = fields.Monetary(
        compute="_compute_withheld_taxes",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    income_withholding = fields.Monetary(
        compute="_compute_withheld_taxes",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    third_withheld_itbis = fields.Monetary(
        compute="_compute_withheld_taxes",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    third_income_withholding = fields.Monetary(
        compute="_compute_withheld_taxes",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )

    payment_date = fields.Date(
        compute="_compute_taxes_fields",
        store=True,
        searchable=True,
    )
    proportionality_tax = fields.Monetary(
        compute="_compute_taxes_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    cost_itbis = fields.Monetary(
        compute="_compute_taxes_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    selective_tax = fields.Monetary(
        compute="_compute_taxes_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    other_taxes = fields.Monetary(
        compute="_compute_taxes_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )
    legal_tip = fields.Monetary(
        compute="_compute_taxes_fields",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )

    advance_itbis = fields.Monetary(
        compute="_compute_advance_itbis",
        store=True,
        currency_field="company_currency_id",
        searchable=True,
    )

    isr_withholding_type = fields.Selection(
        [
            ("01", "Alquileres"),
            ("02", "Honorarios por Servicios"),
            ("03", "Otras Rentas"),
            ("04", "Rentas Presuntas"),
            ("05", "Intereses Pagados a Personas Jurídicas"),
            ("06", "Intereses Pagados a Personas Físicas"),
            ("07", "Retención por Proveedores del Estado"),
            ("08", "Juegos Telefónicos"),
        ],
        string="Tipo de Retención ISR",
        compute="_compute_isr_withholding_type",
        store=True,
        readonly=True,
        help="Tipo de retención de ISR basado en el impuesto asociado a la factura.",
        searchable=True,
    )

    is_exterior = fields.Boolean(
        compute="_compute_is_exterior",
        store=True,
        searchable=True,
    )
    service_type = fields.Selection(
        [
            ("01", "Gastos de Personal"),
            ("02", "Gastos por Trabajos, Suministros y Servicios"),
            ("03", "Arrendamientos"),
            ("04", "Gastos de Activos Fijos"),
            ("05", "Gastos de Representación"),
            ("06", "Gastos Financieros"),
            ("07", "Gastos de Seguros"),
            ("08", "Gastos por Regalías y otros Intangibles"),
        ]
    )
    service_type_detail = fields.Many2one("invoice.service.type.detail")
    fiscal_status = fields.Selection(
        [
            ("normal", "Partial"),
            ("done", "Reported"),
            ("blocked", "Not Sent"),
        ],
        copy=False,
        help="* The 'Grey' status means invoice isn't fully reported and may appear "
             "in other report if a withholding is applied.\n"
             "* The 'Green' status means invoice is fully reported.\n"
             "* The 'Red' status means invoice is included in a non sent DGII report.\n"
             "* The blank status means that the invoice have"
             "not been included in a report.",
    )

    amount_with_isr_withholding = fields.Monetary()

    # ----------------------------------------------------------------------------------
    # BUSINESS METHODS
    # ----------------------------------------------------------------------------------

    @api.model
    def norma_recompute(self):
        """
        Logica de recarculo.

        Este método agrega todos los campos de cálculo en env.add_todo y luego
        vuelve a calcular todos los campos de cálculo en caso de que cambie la
        configuración de dgii y necesite volver a calcular.
        """
        records = self.browse(self._context.get("active_ids", self.ids or []))
        for field_name, field in self.fields_get().items():
            if field.get("store") and field.get("depends"):
                self.env.add_to_compute(self._fields[field_name], records)
        return self.recompute()

    # ----------------------------------------------------------------------------------
    # COMPUTED METHODS
    # ----------------------------------------------------------------------------------

    @api.depends("invoice_line_ids", "invoice_line_ids.product_id", "state")
    def _compute_amount_fields(self):
        """Compute Purchase amount by product type."""
        for inv in self:
            if inv.move_type in ["in_invoice", "in_refund"] and inv.state != "draft":
                lines = inv.invoice_line_ids
                good_amount = sum(
                    line.price_subtotal
                    for line in lines
                    if line.product_id and line.product_id.type in ["product", "consu"]
                )
                service_amount = sum(
                    line.price_subtotal
                    for line in lines
                    if not line.product_id or line.product_id.type == "service"
                )
                inv.good_total_amount = inv._convert_to_local_currency(good_amount)
                inv.service_total_amount = inv._convert_to_local_currency(service_amount)

    @api.depends("state")
    def _compute_invoiced_itbis(self):
        """Compute invoice invoiced_itbis taking into account the currency."""
        for inv in self.filtered(lambda x: x.state != "draft"):
            amount = sum(
                tax.credit if inv.move_type in ["out_invoice", "out_refund"] else tax.debit
                for tax in inv._get_tax_line_ids().filtered(lambda line: line.tax_line_id.amount == 18)
            )
            inv.invoiced_itbis = inv._convert_to_local_currency(amount)

    @api.depends("line_ids.tax_line_id", "line_ids.tax_ids", "state")
    def _compute_taxes_fields(self):
        """Compute invoice common taxes fields."""
        for inv in self.filtered(lambda x: x.state != "draft"):
            taxes = inv._get_tax_line_ids()
            inv.selective_tax = sum(tax.debit for tax in taxes if tax.tax_line_id.tax_group_id.name == "ISC")
            inv.other_taxes = sum(tax.debit for tax in taxes if tax.tax_line_id.tax_group_id.name == "Otros Impuestos")
            inv.legal_tip = sum(tax.debit for tax in taxes if tax.tax_line_id.tax_group_id.name == "Propina")
            inv.proportionality_tax = sum(tax.debit for tax in taxes if tax.account_id.account_fiscal_type in ["A29", "A30"])
            inv.cost_itbis = sum(tax.debit for tax in taxes if tax.account_id.account_fiscal_type == "A51")

            if inv.move_type == "out_invoice" and any([inv.third_withheld_itbis, inv.third_income_withholding]):
                inv._compute_invoice_payment_date()
            elif inv.move_type == "in_invoice" and any([inv.withholded_itbis, inv.income_withholding]):
                inv._compute_invoice_payment_date()

    @api.depends("state", "move_type", "payment_state", "payment_ids")
    def _compute_withheld_taxes(self):
        for inv in self:
            if inv.state != "posted" or inv.move_type not in ("out_invoice", "in_invoice"):
                continue

            withheld_itbis = 0
            withheld_isr = 0
            payment_widget = inv._get_invoice_payment_widget()
            move_ids = [p["move_id"] for p in payment_widget]

            if move_ids:
                aml_ids = self.env["account.move.line"].search([
                    ("move_id", "in", move_ids),
                    ("account_id.account_fiscal_type", "!=", False)
                ])
                is_out_invoice = inv.move_type == "out_invoice"
                withheld_itbis = sum(
                    aml.debit if is_out_invoice else aml.credit
                    for aml in aml_ids
                    if aml.account_id.account_fiscal_type in ("A34", "A36")
                )
                withheld_isr = sum(
                    aml.debit if is_out_invoice else aml.credit
                    for aml in aml_ids
                    if aml.account_id.account_fiscal_type in ("ISR", "A38")
                )
            elif inv.move_type == "in_invoice":
                tax_lines = inv._get_tax_line_ids()
                withheld_itbis = sum(tax.credit for tax in tax_lines if tax.tax_line_id.purchase_tax_type == "ritbis")
                withheld_isr = sum(tax.credit for tax in tax_lines if tax.tax_line_id.purchase_tax_type == "isr")

            if inv.move_type == "out_invoice":
                inv.third_withheld_itbis = withheld_itbis
                inv.third_income_withholding = withheld_isr
            else:
                inv.withholded_itbis = abs(inv._convert_to_local_currency(withheld_itbis))
                inv.income_withholding = abs(inv._convert_to_local_currency(withheld_isr))

    @api.depends("invoiced_itbis", "cost_itbis", "state")
    def _compute_advance_itbis(self):
        for inv in self.filtered(lambda x: x.state != "draft"):
            inv.advance_itbis = inv.invoiced_itbis - inv.cost_itbis

    @api.depends("line_ids.tax_line_id", "state", "move_type", "payment_state")
    def _compute_isr_withholding_type(self):
        for inv in self.filtered(
            lambda i: i.move_type == "in_invoice" and i.state == "posted" and i.payment_state in ("paid", "in_payment")
        ):
            tax_line = inv.line_ids.filtered(lambda line: line.tax_line_id.purchase_tax_type == "isr")
            if tax_line:
                inv.isr_withholding_type = tax_line[0].tax_line_id.isr_retention_type
            else:
                payment_ids = [p.get("move_id") for p in inv._get_invoice_payment_widget()]
                aml_ids = self.env["account.move"].browse(payment_ids).mapped("line_ids").filtered(
                    lambda aml: aml.account_id.isr_retention_type
                )
                inv.isr_withholding_type = aml_ids[0].account_id.isr_retention_type if aml_ids else False

    def _get_payment_string(self):
        """
        Compute Vendor Bills payment method string.
        """
        self.ensure_one()
        payment_data = self._get_invoice_payment_widget()
        payment_ids = [p.get("account_payment_ids", []) for p in payment_data]
        move_ids = [p.get("move_id") for p in payment_data if p.get("move_id")]

        payments = []
        payment_records = self.env["account.payment"].browse(sum(payment_ids, []))
        move_records = self.env["account.move"].browse(move_ids)

        for payment in payment_data:
            payment_id = payment_records.filtered(lambda p: p.id in payment.get("account_payment_ids", []))
            move_id = move_records.filtered(lambda m: m.id == payment.get("move_id"))
            p_string = (
                payment_id.journal_id.l10n_do_payment_form or "credit"
                if payment_id and payment_id.journal_id.type in ["cash", "bank"]
                else "swap" if move_id
                else "credit_note" if not payment_id and not move_id
                else "credit"
            )
            payments.append(p_string)

        methods = set(payments)
        return methods.pop() if len(methods) == 1 else "mixed" if methods else "credit"

    @api.depends("payment_state")
    def _compute_in_invoice_payment_form(self):
        payment_dict = {
            "cash": "01",
            "bank": "02",
            "card": "03",
            "credit": "04",
            "swap": "05",
            "credit_note": "06",
            "mixed": "07",
        }
        for inv in self:
            inv.payment_form = "04"  # Default to credit
        invoices_paid = self.filtered(lambda x: x.payment_state in ("paid", "in_payment"))
        for inv in invoices_paid:
            inv.payment_form = payment_dict.get(inv._get_payment_string(), "04")

    @api.depends("l10n_latam_document_type_id")
    def _compute_is_exterior(self):
        external_invs = self.filtered(
            lambda inv: inv.l10n_latam_document_type_id.doc_code_prefix in ("B17", "E47")
        )
        external_invs.is_exterior = True
        (self - external_invs).is_exterior = False

    def _compute_invoice_payment_date(self):
        for inv in self.filtered(lambda x: x.state == "posted" and x.invoice_date):
            reconciled_info = inv._get_reconciled_info_JSON_values()
            dates = [payment["date"] for payment in reconciled_info if payment.get("date")]
            if dates:
                inv.payment_date = max(max(dates), inv.invoice_date)

    # ----------------------------------------------------------------------------------
    # CONSTRAINTS
    # ----------------------------------------------------------------------------------

    @api.constrains("line_ids")
    def _check_isr_tax(self):
        """Restrict one ISR tax per invoice."""
        for inv in self:
            tax_types = [
                tax_line.tax_line_id.purchase_tax_type
                for tax_line in inv._get_tax_line_ids()
                if tax_line.tax_line_id and tax_line.tax_line_id.purchase_tax_type in ["isr", "ritbis"]
            ]
            if len(tax_types) != len(set(tax_types)):
                raise ValidationError(_("An invoice cannot have multiple withholding taxes."))

    # ----------------------------------------------------------------------------------
    # ONCHANGE METHODS
    # ----------------------------------------------------------------------------------

    @api.onchange("service_type")
    def _onchange_service_type(self):
        self.service_type_detail = False
        return {"domain": {"service_type_detail": [("parent_code", "=", self.service_type)]}}

    @api.onchange("journal_id")
    def _ext_onchange_journal_id(self):
        self.service_type = False
        self.service_type_detail = False

    # ----------------------------------------------------------------------------------
    # PRIVATE METHODS
    # ----------------------------------------------------------------------------------

    def _get_invoice_payment_widget(self):
        self.ensure_one()
        j = json.loads(self.invoice_payments_widget or "{}")
        return j.get("content", [])

    def _get_tax_line_ids(self):
        return self.line_ids.filtered("tax_line_id")

    def _convert_to_local_currency(self, amount):
        if not amount or not self.currency_id or not self.company_id.currency_id:
            return 0.0 if not amount else amount
        date = self.date or fields.Date.today()
        sign = -1 if self.move_type in ["in_refund", "out_refund"] else 1
        return self.currency_id._convert(amount, self.company_id.currency_id, self.company_id, date) * sign

    def _get_payment_move_iterator(self, payment, inv_type, witheld_type):
        payment_ids = self.env["account.payment"].browse(payment.get("account_payment_ids", []))
        if payment_ids:
            move_lines = payment_ids.move_line_ids.filtered(
                lambda ml: ml.account_id.account_fiscal_type in witheld_type
            )
            return [ml.debit if inv_type == "out_invoice" else ml.credit for ml in move_lines]

        move_id = self.env["account.move"].browse(payment.get("move_id"))
        if move_id:
            move_lines = move_id.line_ids.filtered(
                lambda ml: ml.account_id.account_fiscal_type in witheld_type
            )
            return [ml.debit if inv_type == "out_invoice" else ml.credit for ml in move_lines]
        return []

    # ----------------------------------------------------------------------------------
    # OVERRIDE METHODS
    # ----------------------------------------------------------------------------------

    def _compute_amount(self):
        """Handle ISR retention according to accountant guidelines."""
        super()._compute_amount()
        for move in self:
            if move.payment_state not in ("paid", "in_payment"):
                move.amount_total = move.amount_total or 0.0
                withheld_isr = sum(
                    line.balance
                    for line in move.line_ids
                    if line.tax_line_id and line.tax_line_id.purchase_tax_type == "isr"
                )
                if withheld_isr:
                    move.amount_total += abs(withheld_isr)