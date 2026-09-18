from odoo import models, api, fields, _
from odoo.exceptions import UserError

class AccountMoveReversal(models.TransientModel):
    _inherit = "account.move.reversal"

    @api.model
    def _get_refund_type_selection(self):
        return [
            ("full_refund", _("Full Refund")),
            ("percentage", _("Percentage")),
            ("fixed_amount", _("Amount")),
        ]

    @api.model
    def _get_default_refund_type(self):
        return "full_refund"

    @api.model
    def _get_refund_action_selection(self):
        return [
            ("draft_refund", _("Partial Refund")),
            ("apply_refund", _("Full Refund")),
        ]

    @api.model
    def _default_account(self):
        move_type = self._context.get("move_type")
        journal = (
            self.env["account.journal"]
            .with_context(
                default_type=move_type, default_company_id=self.env.company.id
            )
            .search([], limit=1)
        )
        if move_type in ("out_invoice", "in_refund"):
            return journal.default_credit_account_id.id if journal.default_credit_account_id else None
        return journal.default_debit_account_id.id if journal.default_debit_account_id else None

    country_code = fields.Char(
        related="company_id.country_code",
        help="Technical field used to hide/show fields regarding the localization",
    )
    refund_type = fields.Selection(
        selection=_get_refund_type_selection,
        default=_get_default_refund_type,
    )
    refund_action = fields.Selection(
        selection=_get_refund_action_selection,
        default="draft_refund",
        string="Refund Action",
    )
    percentage = fields.Float()
    amount = fields.Float()
    l10n_do_ecf_modification_code = fields.Selection(
        selection=lambda self: self.env["account.move"]._get_l10n_do_ecf_modification_code(),
        string="e-CF Modification Code",
        copy=False,
    )
    is_ecf_invoice = fields.Boolean(
        string="Is Electronic Invoice",
    )

    @api.depends("l10n_latam_document_type_id", "country_code", "l10n_latam_use_documents")
    def _compute_l10n_latam_manual_document_number(self):
        self.l10n_latam_manual_document_number = False
        l10n_do_recs = self.filtered(
            lambda r: r.move_ids and r.l10n_latam_use_documents and r.country_code == "DO"
        )
        for rec in l10n_do_recs:
            move = rec.move_ids[0]
            rec.l10n_latam_manual_document_number = move.l10n_latam_manual_document_number

        super(AccountMoveReversal, self - l10n_do_recs)._compute_l10n_latam_manual_document_number()

    @api.model
    def default_get(self, fields):
        res = super().default_get(fields)
        move_ids = (
            self.env["account.move"].browse(self.env.context["active_ids"])
            if self.env.context.get("active_model") == "account.move"
            else self.env["account.move"]
        )
        move_ids_use_document = move_ids.filtered(
            lambda move: move.l10n_latam_use_documents and move.company_id.country_code == "DO"
        )

        if len(move_ids_use_document) > 1:
            raise UserError(_("You cannot create Credit Notes from multiple documents at a time."))
        if move_ids_use_document:
            res["is_ecf_invoice"] = move_ids_use_document[0].is_ecf_invoice

        return res

    @api.onchange("refund_type")
    def onchange_refund_type(self):
        pass #remove the onchange for refund_type, since the refund_method field does not exist.

    @api.onchange("refund_action")
    def onchange_refund_action(self):
        pass #remove the onchange for refund_action, since the refund_method field does not exist.

    def reverse_moves(self):
        return super(
            AccountMoveReversal,
            self.with_context(
                refund_type=self.refund_type,
                percentage=self.percentage,
                amount=self.amount,
                reason=self.reason,
                l10n_do_ecf_modification_code=self.l10n_do_ecf_modification_code,
            ),
        ).reverse_moves()