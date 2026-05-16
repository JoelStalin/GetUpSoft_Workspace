from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)


class PartnerBenefitPending(models.Model):
    _name = "partner.benefit.pending"
    _description = "Beneficio o Descuento Pendiente de Aplicar"
    _order = "generation_date desc, partner_id"

    # === CAMPOS ===

    partner_id = fields.Many2one(
        'res.partner', string="Proveedor", required=True, readonly=True, index=True)

    partner_benefit_discount_id = fields.Many2one(
        'partner.benefit.discount', string="Configuración de Beneficio", required=True, readonly=True)

    benefit_discount_cicle_id = fields.Many2one(
        'benefit.discount.cicle', string="Ciclo de Generación", required=True, readonly=True)

    product_tmpl_id = fields.Many2one(
        'product.template', string="Producto",
        related='partner_benefit_discount_id.benefit_discount_id.product_tmpl_id',
        store=True, readonly=True)

    amount = fields.Float(string="Monto Unitario", required=True, readonly=True)
    quantity = fields.Integer(string="Cantidad", required=True, readonly=True, default=1)

    generation_date = fields.Date(
        string="Fecha de Generación", required=True, readonly=True,
        default=fields.Date.context_today, index=True)

    state = fields.Selection([
        ('pending', 'Pendiente'),
        ('applied', 'Aplicado'),
    ], string="Estado", default='pending', required=True, index=True)

    move_line_id = fields.Many2one(
        'account.move.line', string="Línea de Factura Aplicada", readonly=True, copy=False)

    move_id = fields.Many2one(
        'account.move', string="Factura Aplicada",
        compute='_compute_move_id', store=True,
        readonly=True, copy=False)

    applied_amount = fields.Monetary(
        string="Monto Aplicado",
        compute='_compute_applied_amount',
        store=True,
        readonly=True,
        currency_field='currency_id')

    currency_id = fields.Many2one(
        'res.currency', string='Moneda',
        compute='_compute_currency_id',
        store=True,
        readonly=True)

    unique_key = fields.Char(string="Clave Única", compute='_compute_unique_key', store=True)
    
    vehicles_json = fields.Text(string="Vehículos", readonly=True, help="Lista de vehículos retornados por la API de EXO.")

    _sql_constraints = [
        ('unique_key_constraint', 'unique(unique_key)', 'Ya existe un beneficio generado para este partner, ciclo y mes.')
    ]

    # === MÉTODOS COMPUTADOS ===

    @api.depends('move_line_id', 'state')
    def _compute_applied_amount(self):
        for record in self:
            if record.state == 'applied' and record.move_line_id:
                record.applied_amount = abs(record.move_line_id.price_subtotal or 0.0)
            else:
                record.applied_amount = 0.0

    @api.depends('move_id')
    def _compute_currency_id(self):
        for record in self:
            record.currency_id = record.move_id.currency_id or self.env.company.currency_id

    @api.depends('partner_id', 'partner_benefit_discount_id', 'benefit_discount_cicle_id', 'generation_date')
    def _compute_unique_key(self):
        for record in self:
            if record.generation_date:
                date_str = record.generation_date.strftime('%Y-%m')
                record.unique_key = (
                    f"{record.partner_id.id}-"
                    f"{record.partner_benefit_discount_id.id}-"
                    f"{record.benefit_discount_cicle_id.id}-"
                    f"{date_str}"
                )
            else:
                record.unique_key = False

    @api.depends('move_line_id')
    def _compute_move_id(self):
        for record in self:
            record.move_id = record.move_line_id.move_id if record.move_line_id else False

    # === HELPER PARA FORZAR CAMPOS COMPUTADOS ===

    def _force_recompute_fields(self, fields_to_compute):
        """Forzar el recálculo manual de campos @api.depends en Odoo 15."""
        for rec in self:
            if 'move_id' in fields_to_compute:
                rec._compute_move_id()
            if 'currency_id' in fields_to_compute:
                rec._compute_currency_id()
            if 'applied_amount' in fields_to_compute:
                rec._compute_applied_amount()
            if 'unique_key' in fields_to_compute:
                rec._compute_unique_key()

    # === BOTÓN INDIVIDUAL DESDE FORMULARIO ===

    def recompute_this_record(self):
        """Recalcular campos computados solo para este registro."""
        self._force_recompute_fields(['move_id', 'currency_id'])
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _("Línea actualizada"),
                'message': _("El registro fue recalculado correctamente."),
                'type': 'success',
                'sticky': False,
            }
        }

    # === BOTÓN GLOBAL DESDE IR.ACTIONS.SERVER ===

    @api.model
    def force_recompute_move_ids(self):
        """Recalcula campos computados para todos los registros con move_line_id."""
        records = self.search([('move_line_id', '!=', False)])
        total = len(records)

        if total:
            records._force_recompute_fields(['move_id', 'currency_id'])
            _logger.info("✅ Se recalcularon %s registros en partner.benefit.pending", total)
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _("Proceso completado"),
                    'message': _("%s registros recalculados correctamente." % total),
                    'type': 'success',
                    'sticky': False,
                }
            }

        _logger.info("ℹ️ No hay registros para recalcular en partner.benefit.pending")
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _("Sin registros"),
                'message': _("No hay beneficios con líneas de factura asignadas."),
                'type': 'warning',
                'sticky': False,
            }
        }
