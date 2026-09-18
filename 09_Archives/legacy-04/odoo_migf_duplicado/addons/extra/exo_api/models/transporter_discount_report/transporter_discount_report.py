# -*- coding: utf-8 -*-
from odoo import models, fields, tools


class TransporterDiscountReport(models.Model):
    _name = 'transporter.discount.report'
    _description = 'Reporte de Descuentos a Transportistas por Mes'
    _auto = False
    _rec_name = 'partner_id'

    partner_id = fields.Many2one('res.partner', string='Transportista (Proveedor)', readonly=True)
    currency_id = fields.Many2one('res.currency', string='Moneda', readonly=True)
    discount_product_name = fields.Char(string='Nombre del Descuento', readonly=True)
    year = fields.Char(string='Año', readonly=True)

    discount_amount = fields.Monetary(
        string='Total de Descuentos',
        readonly=True,
        currency_field='currency_id'
    )

    amount_jan = fields.Monetary(string='Enero', readonly=True, currency_field='currency_id')
    amount_feb = fields.Monetary(string='Febrero', readonly=True, currency_field='currency_id')
    amount_mar = fields.Monetary(string='Marzo', readonly=True, currency_field='currency_id')
    amount_apr = fields.Monetary(string='Abril', readonly=True, currency_field='currency_id')
    amount_may = fields.Monetary(string='Mayo', readonly=True, currency_field='currency_id')
    amount_jun = fields.Monetary(string='Junio', readonly=True, currency_field='currency_id')
    amount_jul = fields.Monetary(string='Julio', readonly=True, currency_field='currency_id')
    amount_aug = fields.Monetary(string='Agosto', readonly=True, currency_field='currency_id')
    amount_sep = fields.Monetary(string='Septiembre', readonly=True, currency_field='currency_id')
    amount_oct = fields.Monetary(string='Octubre', readonly=True, currency_field='currency_id')
    amount_nov = fields.Monetary(string='Noviembre', readonly=True, currency_field='currency_id')
    amount_dec = fields.Monetary(string='Diciembre', readonly=True, currency_field='currency_id')

    def init(self):
        tools.drop_view_if_exists(self.env.cr, self._table)
        self.env.cr.execute(f"""
            CREATE OR REPLACE VIEW {self._table} AS (
                SELECT
                    MIN(aml.id) AS id,
                    am.partner_id,
                    am.currency_id,
                    TO_CHAR(am.invoice_date, 'YYYY') AS year,
                    MAX(aml.name) AS discount_product_name,

                    COALESCE(SUM(
                        CASE
                            WHEN pt.name ILIKE  '%GPS%'
                            THEN -aml.price_subtotal
                            ELSE 0
                        END
                    ), 0) AS discount_amount,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '01' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_jan,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '02' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_feb,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '03' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_mar,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '04' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_apr,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '05' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_may,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '06' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_jun,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '07' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_jul,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '08' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_aug,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '09' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_sep,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '10' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_oct,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '11' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_nov,

                    COALESCE(SUM(CASE WHEN TO_CHAR(am.invoice_date, 'MM') = '12' 
                        AND (aml.name ILIKE  '%GPS%')
                        THEN -aml.price_subtotal ELSE 0 END), 0) AS amount_dec

                FROM account_move am
                LEFT JOIN account_move_line aml ON aml.move_id = am.id
                LEFT JOIN product_product pp ON pp.id = aml.product_id
                LEFT JOIN product_template pt ON pt.id = pp.product_tmpl_id

                WHERE am.move_type = 'in_invoice'
                  AND am.partner_id IS NOT NULL
                  AND (aml.name ILIKE  '%GPS%')

                GROUP BY am.partner_id, am.currency_id, TO_CHAR(am.invoice_date, 'YYYY')
            )
        """)
