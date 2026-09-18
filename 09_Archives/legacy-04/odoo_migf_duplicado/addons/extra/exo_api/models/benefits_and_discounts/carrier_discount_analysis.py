# -*- coding: utf-8 -*-
from odoo import models, fields, api

class CarrierDiscountAnalysis(models.Model):
    _name = 'carrier.discount.analysis'
    _description = 'Análisis de Descuentos a Transportistas'
    _order = 'total_discount_amount desc'

    # Campos de identificación
    carrier_id = fields.Many2one('res.partner', string='Transportista', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Moneda', readonly=True, default=lambda self: self.env.company.currency_id)
    start_date = fields.Date(string='Fecha Inicio', readonly=True)
    end_date = fields.Date(string='Fecha Fin', readonly=True)

    # Datos relevantes para el análisis
    invoice_count = fields.Integer(string='Nº de Facturas', readonly=True)
    invoices_with_discount_count = fields.Integer(string='Facturas con Descuento', readonly=True)
    
    # Montos
    total_invoiced_amount = fields.Monetary(string='Total Facturado', readonly=True)
    total_discount_amount = fields.Monetary(string='Total Descuento', readonly=True)
    
    # Campo computado para la vista gráfica y la barra de progreso
    average_discount_percentage = fields.Float(
        string='Descuento Promedio (%)',
        compute='_compute_average_discount',
        store=True,
        group_operator='avg',
        readonly=True
    )

    @api.depends('total_invoiced_amount', 'total_discount_amount')
    def _compute_average_discount(self):
        for record in self:
            # La base para el porcentaje es el total antes del descuento
            base_total = record.total_invoiced_amount + record.total_discount_amount
            if base_total > 0:
                record.average_discount_percentage = (record.total_discount_amount / base_total) * 100
            else:
                record.average_discount_percentage = 0.0