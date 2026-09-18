from odoo import api, fields, models

class AccountTax(models.Model):
    """Agrega los campos necesarios para el reporte DGII."""

    _inherit = "account.tax"

    PURCHASE_TAX_TYPE_SELECTION = [
        ("itbis", "ITBIS Pagado"),
        ("ritbis", "ITBIS Retenido"),
        ("isr", "ISR Retenido"),
        ("rext", "Pagos al Exterior (Ley 253-12)"),
        ("not_deductible", "No Deducible"),
    ]

    ISR_RETENTION_TYPE_SELECTION = [
        ("01", "Alquileres"),
        ("02", "Honorarios por Servicios"),
        ("03", "Otras Rentas"),
        ("04", "Rentas Presuntas"),
        ("05", "Intereses Pagados a Personas Jurídicas"),
        ("06", "Intereses Pagados a Personas Físicas"),
        ("07", "Retención por Proveedores del Estado"),
        ("08", "Juegos Telefónicos"),
    ]

    purchase_tax_type = fields.Selection(
        PURCHASE_TAX_TYPE_SELECTION,
        default="not_deductible",
        string="Tipo de Impuesto en Compra",
        help="Define el tipo de impuesto aplicado a las compras. Esto afectará "
             "cómo se reporta la factura en los informes fiscales.",
    )

    isr_retention_type = fields.Selection(
        ISR_RETENTION_TYPE_SELECTION,
        string="Tipo de Retención en ISR",
        help="Tipo de retención de ISR que aplica a esta configuración de impuestos."
    )
