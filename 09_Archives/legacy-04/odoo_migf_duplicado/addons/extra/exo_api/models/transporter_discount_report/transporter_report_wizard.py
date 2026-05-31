# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class TransporterReportWizard(models.TransientModel):
    _name = 'transporter.report.wizard'
    _description = 'Asistente para Reporte de Descuentos de Transportista'

    date_from = fields.Date(
        string='Desde',
        required=True,
        default=fields.Date.today
    )
    date_to = fields.Date(
        string='Hasta',
        required=True,
        default=fields.Date.today
    )

    # Producto exacto (Many2one)
    product_id = fields.Many2one(
        'product.product',
        string='Producto de Descuento',
        help='Selecciona un producto específico para filtrar el reporte'
    )

    # Texto libre (parcial, ej: GPS)
    product_name = fields.Char(
        string='Nombre parcial del Producto/Descuento',
        help='Escriba parte del nombre del producto, ejemplo: GPS'
    )

    include_without_discount = fields.Boolean(
        string="Incluir líneas sin descuentos",
        default=False
    )

    @api.constrains('date_from', 'date_to')
    def _check_dates(self):
        for rec in self:
            if rec.date_from > rec.date_to:
                raise ValidationError("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")

    def action_generate_report(self):
        self.ensure_one()

        domain = [
            ('year', '>=', self.date_from.strftime('%Y')),
            ('year', '<=', self.date_to.strftime('%Y')),
        ]

        # Filtro por producto exacto
        if self.product_id:
            domain.append(('discount_product_name', 'ilike', self.product_id.name))

        # Filtro por texto parcial
        if self.product_name:
            domain.append(('discount_product_name', 'ilike', self.product_name))

        # Filtro para incluir/excluir sin descuentos
        if not self.include_without_discount:
            domain.append(('discount_product_name', '!=', False))
        elif self.include_without_discount and (self.product_id or self.product_name):
            domain = ['|'] + domain + [('discount_product_name', '=', False)]

        return {
            'name': 'Reporte de Descuentos a Transportistas',
            'type': 'ir.actions.act_window',
            'res_model': 'transporter.discount.report',
            'view_mode': 'tree',
            'domain': domain,
            'context': {'search_default_groupby_partner': 1},
        }
