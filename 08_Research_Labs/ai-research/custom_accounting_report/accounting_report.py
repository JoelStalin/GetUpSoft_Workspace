# -*- coding: utf-8 -*-
from odoo import models, fields, api, tools, _
import logging

_logger = logging.getLogger(__name__)


class AccountingReportLine(models.Model):
    """Linea del reporte contable (vista SQL)."""
    _name = 'custom.accounting.report.line'
    _description = 'Linea de Reporte Contable Personalizado (SQL)'
    _auto = False
    _order = 'fecha_carga desc, id_carga, tipo_de_facturacion'

    id_carga = fields.Char(string='Id_carga', readonly=True)
    no_carga = fields.Char(string='No_Carga', readonly=True)
    shipper = fields.Char(string='Shipper', readonly=True)
    transportista = fields.Char(string='Transportista', readonly=True)
    estatus_carga = fields.Char(string='Estatus_carga', readonly=True)
    fact_shipper = fields.Char(string='Fact_shipper', readonly=True)
    fact_transportista = fields.Char(string='Fact_transportista', readonly=True)
    monto_fact_shipper = fields.Float(string='Monto_fact_shipper', readonly=True)
    monto_fact_transportista = fields.Float(string='Monto_fact_transportista', readonly=True)
    bloque = fields.Char(string='Bloque', readonly=True)
    fecha_carga = fields.Datetime(string='Fecha_carga', readonly=True)
    fecha_factura = fields.Date(string='Fecha_factura', readonly=True)
    warehouse = fields.Char(string='Warehouse', readonly=True)
    estatus_fact_shipper = fields.Char(string='Estatus_fact_shipper', readonly=True)
    estatus_fact_transportista = fields.Char(string='Estatus_fact_transportista', readonly=True)
    tipo_de_facturacion = fields.Char(string='Tipo_de_facturacion', readonly=True)

    # Campos tecnicos para filtros/multi-company
    company_id = fields.Many2one('res.company', string='Empresa', readonly=True)
    shipper_id = fields.Many2one('res.partner', string='Shipper (ID)', readonly=True)
    transportista_id = fields.Many2one('res.partner', string='Transportista (ID)', readonly=True)

    def init(self):
        tools.drop_view_if_exists(self.env.cr, self._table)
        self.env.cr.execute(f"""
            CREATE OR REPLACE VIEW {self._table} AS (
                WITH base AS (
                    SELECT
                        COALESCE(l.original_load_id, l.load_id) AS id_carga,
                        MIN(l.id) AS base_id,
                        MIN(l.load_number) AS no_carga,
                        MAX(l.shipper) AS shipper,
                        MAX(transporter.name) AS transportista,
                        MAX(l.status) AS estatus_carga,
                        MAX(CASE WHEN l.move_type = 'invoice'
                            THEN COALESCE(NULLIF(m.name, '/'), m.draft_name)
                        END) AS fact_shipper,
                        MAX(CASE WHEN l.move_type = 'bill'
                            THEN COALESCE(NULLIF(m.name, '/'), m.draft_name)
                        END) AS fact_transportista,
                        SUM(CASE WHEN l.move_type = 'invoice'
                            THEN COALESCE(aml.price_subtotal / NULLIF(aml.load_qty, 0), aml.price_subtotal, 0)
                            ELSE 0
                        END) AS monto_fact_shipper,
                        SUM(CASE WHEN l.move_type = 'bill'
                            THEN COALESCE(aml.price_subtotal / NULLIF(aml.load_qty, 0), aml.price_subtotal, 0)
                            ELSE 0
                        END) AS monto_fact_transportista,
                        MAX(CASE WHEN l.move_type = 'invoice' THEN m.load_invoice_code END) AS bloque_shipper,
                        MAX(CASE WHEN l.move_type = 'bill' THEN m.load_invoice_code END) AS bloque_transportista,
                        MAX(l.load_date) AS fecha_carga,
                        MAX(CASE WHEN l.move_type = 'invoice' THEN m.invoice_date END) AS fecha_factura_shipper,
                        MAX(CASE WHEN l.move_type = 'bill' THEN m.invoice_date END) AS fecha_factura_transportista,
                        MAX(
                            CASE
                                WHEN l.json_current_load IS NULL OR l.json_current_load = '' THEN NULL
                                ELSE
                                    CASE
                                        WHEN jsonb_typeof((l.json_current_load)::jsonb->'warehouse') = 'object'
                                            THEN (l.json_current_load)::jsonb->'warehouse'->>'name'
                                        ELSE (l.json_current_load)::jsonb->>'warehouse'
                                    END
                            END
                        ) AS warehouse,
                        MAX(CASE WHEN l.move_type = 'invoice'
                            THEN CASE WHEN m.state = 'posted' THEN 'Facturado' ELSE 'No facturado' END
                        END) AS estatus_fact_shipper,
                        MAX(CASE WHEN l.move_type = 'bill'
                            THEN CASE WHEN m.state = 'posted' THEN 'Facturado' ELSE 'No facturado' END
                        END) AS estatus_fact_transportista,
                        MAX(CASE WHEN l.move_type = 'invoice' THEN m.company_id END) AS company_id_shipper,
                        MAX(CASE WHEN l.move_type = 'bill' THEN m.company_id END) AS company_id_transportista,
                        MAX(l.shipper_id) AS shipper_id,
                        MAX(l.transporter_id) AS transportista_id
                    FROM account_line_load l
                    LEFT JOIN account_move m ON m.id = l.account_move_id
                    LEFT JOIN account_move_line aml ON aml.id = l.account_line_id
                    LEFT JOIN res_partner transporter ON transporter.id = l.transporter_id
                    GROUP BY COALESCE(l.original_load_id, l.load_id)
                ),
                tipos AS (
                    SELECT 'Shipper'::text AS tipo_de_facturacion, 0 AS tipo_order
                    UNION ALL
                    SELECT 'Transportista'::text, 1
                )
                SELECT
                    (base.base_id * 2) + tipos.tipo_order + 1 AS id,
                    base.id_carga,
                    base.no_carga,
                    base.shipper,
                    base.transportista,
                    base.estatus_carga,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.fact_shipper ELSE NULL END AS fact_shipper,
                    CASE WHEN tipos.tipo_de_facturacion = 'Transportista' THEN base.fact_transportista ELSE NULL END AS fact_transportista,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.monto_fact_shipper ELSE 0 END AS monto_fact_shipper,
                    CASE WHEN tipos.tipo_de_facturacion = 'Transportista' THEN base.monto_fact_transportista ELSE 0 END AS monto_fact_transportista,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.bloque_shipper ELSE base.bloque_transportista END AS bloque,
                    base.fecha_carga,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.fecha_factura_shipper ELSE base.fecha_factura_transportista END AS fecha_factura,
                    base.warehouse,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.estatus_fact_shipper ELSE NULL END AS estatus_fact_shipper,
                    CASE WHEN tipos.tipo_de_facturacion = 'Transportista' THEN base.estatus_fact_transportista ELSE NULL END AS estatus_fact_transportista,
                    tipos.tipo_de_facturacion,
                    CASE WHEN tipos.tipo_de_facturacion = 'Shipper' THEN base.company_id_shipper ELSE base.company_id_transportista END AS company_id,
                    base.shipper_id,
                    base.transportista_id
                FROM base
                CROSS JOIN tipos
            )
        """)


class AccountingReportSelection(models.TransientModel):
    """Seleccion de registros para el reporte (snapshot)."""
    _name = 'custom.accounting.report.selection'
    _description = 'Seleccion de Reporte Contable Personalizado'
    _order = 'fecha_carga desc, id_carga, tipo_de_facturacion'
    _log_access = False

    wizard_id = fields.Many2one(
        'custom.accounting.report.wizard',
        string='Wizard',
        ondelete='cascade',
        required=True
    )
    selected = fields.Boolean(string='Seleccionado', default=True)

    id_carga = fields.Char(string='Id_carga', readonly=True)
    no_carga = fields.Char(string='No_Carga', readonly=True)
    shipper = fields.Char(string='Shipper', readonly=True)
    transportista = fields.Char(string='Transportista', readonly=True)
    estatus_carga = fields.Char(string='Estatus_carga', readonly=True)
    fact_shipper = fields.Char(string='Fact_shipper', readonly=True)
    fact_transportista = fields.Char(string='Fact_transportista', readonly=True)
    monto_fact_shipper = fields.Float(string='Monto_fact_shipper', readonly=True)
    monto_fact_transportista = fields.Float(string='Monto_fact_transportista', readonly=True)
    bloque = fields.Char(string='Bloque', readonly=True)
    fecha_carga = fields.Datetime(string='Fecha_carga', readonly=True)
    fecha_factura = fields.Date(string='Fecha_factura', readonly=True)
    warehouse = fields.Char(string='Warehouse', readonly=True)
    estatus_fact_shipper = fields.Char(string='Estatus_fact_shipper', readonly=True)
    estatus_fact_transportista = fields.Char(string='Estatus_fact_transportista', readonly=True)
    tipo_de_facturacion = fields.Char(string='Tipo_de_facturacion', readonly=True)

    company_id = fields.Many2one('res.company', string='Empresa', readonly=True)
    shipper_id = fields.Many2one('res.partner', string='Shipper (ID)', readonly=True)
    transportista_id = fields.Many2one('res.partner', string='Transportista (ID)', readonly=True)


class AccountingReportAbstract(models.AbstractModel):
    """Modelo abstracto para la logica del reporte contable."""
    _name = 'report.exo_api.report_accounting'
    _description = 'Reporte Contable Personalizado'

    @api.model
    def _get_report_values(self, docids, data=None):
        data = data or {}
        wizard_id = data.get('wizard_id')
        if wizard_id:
            docs = self.env['custom.accounting.report.wizard'].browse(wizard_id)
        else:
            docs = self.env['custom.accounting.report.wizard'].browse(docids)

        line_model = self.env['custom.accounting.report.selection']
        lines_by_id = {}
        line_counts = {}

        for wizard in docs:
            wizard._compute_report_stats()
            domain = wizard._get_report_domain()
            lines_by_id[wizard.id] = line_model.search(domain, order=wizard._get_report_order())
            line_counts[wizard.id] = wizard.line_count

        generated_at = fields.Datetime.context_timestamp(self, fields.Datetime.now())

        return {
            'doc_ids': docids,
            'doc_model': 'custom.accounting.report.wizard',
            'data': data,
            'docs': docs,
            'lines_by_id': lines_by_id,
            'line_counts': line_counts,
            'generated_at': generated_at,
            'company': self.env.company,
        }
