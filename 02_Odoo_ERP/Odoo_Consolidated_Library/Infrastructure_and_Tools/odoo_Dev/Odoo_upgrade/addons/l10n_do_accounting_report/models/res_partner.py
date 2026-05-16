from odoo import fields, models


class ResPartner(models.Model):
    """Extensión de res.partner para relación con terceros."""

    _inherit = "res.partner"

    related = fields.Boolean(
        string="Is Related",
        default=False,
        help="Indicates if the partner is related to the company."
    )
