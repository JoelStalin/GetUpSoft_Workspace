# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import date, datetime, time, timedelta
import logging

_logger = logging.getLogger(__name__)
MAX_LINES_REDIRECT = 5000


class AccountingReportWizard(models.TransientModel):
    """Wizard para configurar y generar el reporte contable personalizado."""
    _name = 'custom.accounting.report.wizard'
    _description = 'Wizard Reporte Contable Personalizado'

    # === FILTROS DE FECHA ===
    date_from = fields.Date(
        string='Fecha Desde',
        required=True,
        default=lambda self: date(date.today().year, 1, 1)
    )
    date_to = fields.Date(
        string='Fecha Hasta',
        required=True,
        default=fields.Date.context_today
    )

    # === FILTROS ===
    year = fields.Integer(
        string='Año',
        required=False
    )
    company_id = fields.Many2one(
        'res.company',
        string='Empresa',
        required=True,
        default=lambda self: self.env.company
    )
    shipper_id = fields.Many2one(
        'res.partner',
        string='Shipper'
    )
    transportista_id = fields.Many2one(
        'res.partner',
        string='Transportista'
    )
    estatus_carga = fields.Char(
        string='Estatus Carga'
    )
    warehouse = fields.Char(
        string='Warehouse'
    )
    tipo_de_facturacion = fields.Selection(
        [('Shipper', 'Shipper'), ('Transportista', 'Transportista')],
        string='Tipo de facturacion'
    )

    # === TOTALES ===
    total_monto_fact_shipper = fields.Monetary(
        string='Total Monto Fact. Shipper',
        currency_field='currency_id',
        readonly=True
    )
    total_monto_fact_transportista = fields.Monetary(
        string='Total Monto Fact. Transportista',
        currency_field='currency_id',
        readonly=True
    )
    line_count = fields.Integer(string='Total Lineas', readonly=True)
    currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        readonly=True
    )
    selection_line_ids = fields.One2many(
        'custom.accounting.report.selection',
        'wizard_id',
        string='Registros'
    )

    @api.constrains('date_from', 'date_to')
    def _check_dates(self):
        for wizard in self:
            if wizard.date_from > wizard.date_to:
                raise ValidationError(_('La fecha inicial no puede ser mayor a la fecha final.'))

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for wizard in records:
            wizard._load_selection_lines()
        return records

    @api.onchange('company_id')
    def _onchange_company_id(self):
        for wizard in self:
            if wizard.id:
                wizard._load_selection_lines()

    # -----------------------------
    # Dominio / SQL
    # -----------------------------
    def _is_valid_year(self):
        return bool(self.year and 1900 <= self.year <= 2100)

    def _load_selection_lines(self):
        self.ensure_one()
        selection_model = self.env['custom.accounting.report.selection']
        selection_model.search([('wizard_id', '=', self.id)]).unlink()

        source_table = self.env['custom.accounting.report.line']._table
        target_table = selection_model._table
        self.env.cr.execute(f"""
            INSERT INTO {target_table} (
                wizard_id,
                selected,
                id_carga,
                no_carga,
                shipper,
                transportista,
                estatus_carga,
                fact_shipper,
                fact_transportista,
                monto_fact_shipper,
                monto_fact_transportista,
                bloque,
                fecha_carga,
                fecha_factura,
                warehouse,
                estatus_fact_shipper,
                estatus_fact_transportista,
                tipo_de_facturacion,
                company_id,
                shipper_id,
                transportista_id
            )
            SELECT
                %s AS wizard_id,
                TRUE AS selected,
                id_carga,
                no_carga,
                shipper,
                transportista,
                estatus_carga,
                fact_shipper,
                fact_transportista,
                monto_fact_shipper,
                monto_fact_transportista,
                bloque,
                fecha_carga,
                fecha_factura,
                warehouse,
                estatus_fact_shipper,
                estatus_fact_transportista,
                tipo_de_facturacion,
                company_id,
                shipper_id,
                transportista_id
            FROM {source_table}
            WHERE company_id = %s
        """, [self.id, self.company_id.id])

    def _ensure_selection_loaded(self):
        self.ensure_one()
        if not self.selection_line_ids:
            self._load_selection_lines()

    def _get_report_domain(self):
        self.ensure_one()
        self._ensure_selection_loaded()
        date_from_dt = datetime.combine(self.date_from, time.min)
        date_to_dt = datetime.combine(self.date_to + timedelta(days=1), time.min)
        domain = [
            ('wizard_id', '=', self.id),
            ('selected', '=', True),
            ('company_id', '=', self.company_id.id),
            '|',
                '&', ('fecha_carga', '>=', date_from_dt), ('fecha_carga', '<', date_to_dt),
                '&', ('fecha_factura', '>=', self.date_from), ('fecha_factura', '<=', self.date_to),
        ]

        if self._is_valid_year():
            year_start = date(self.year, 1, 1)
            year_end = date(self.year, 12, 31)
            year_start_dt = datetime.combine(year_start, time.min)
            year_end_dt = datetime.combine(year_end + timedelta(days=1), time.min)
            domain.extend([
                '|',
                    '&', ('fecha_carga', '>=', year_start_dt), ('fecha_carga', '<', year_end_dt),
                    '&', ('fecha_factura', '>=', year_start), ('fecha_factura', '<=', year_end),
            ])

        if self.shipper_id:
            domain.append(('shipper_id', '=', self.shipper_id.id))
        if self.transportista_id:
            domain.append(('transportista_id', '=', self.transportista_id.id))
        if self.estatus_carga:
            domain.append(('estatus_carga', 'ilike', self.estatus_carga))
        if self.warehouse:
            domain.append(('warehouse', 'ilike', self.warehouse))
        if self.tipo_de_facturacion:
            domain.append(('tipo_de_facturacion', '=', self.tipo_de_facturacion))

        return domain

    def _get_report_order(self):
        return 'fecha_carga desc, id_carga, tipo_de_facturacion'

    def _get_sql_where(self):
        self.ensure_one()
        self._ensure_selection_loaded()
        where = [
            'wizard_id = %s',
            'selected = TRUE',
            'company_id = %s',
            '((fecha_carga::date >= %s AND fecha_carga::date <= %s)'
            ' OR (fecha_factura >= %s AND fecha_factura <= %s))'
        ]
        params = [
            self.id,
            self.company_id.id,
            self.date_from,
            self.date_to,
            self.date_from,
            self.date_to,
        ]

        if self._is_valid_year():
            year_start = date(self.year, 1, 1)
            year_end = date(self.year, 12, 31)
            year_start_dt = datetime.combine(year_start, time.min)
            year_end_dt = datetime.combine(year_end + timedelta(days=1), time.min)
            where.append('((fecha_carga >= %s AND fecha_carga < %s) OR (fecha_factura >= %s AND fecha_factura <= %s))')
            params.extend([year_start_dt, year_end_dt, year_start, year_end])

        if self.shipper_id:
            where.append('shipper_id = %s')
            params.append(self.shipper_id.id)
        if self.transportista_id:
            where.append('transportista_id = %s')
            params.append(self.transportista_id.id)
        if self.estatus_carga:
            where.append('estatus_carga ILIKE %s')
            params.append(f"%{self.estatus_carga}%")
        if self.warehouse:
            where.append('warehouse ILIKE %s')
            params.append(f"%{self.warehouse}%")
        if self.tipo_de_facturacion:
            where.append('tipo_de_facturacion = %s')
            params.append(self.tipo_de_facturacion)

        where_sql = ' WHERE ' + ' AND '.join(where)
        return where_sql, params

    def _compute_report_stats(self):
        self.ensure_one()
        self._ensure_selection_loaded()
        where_sql, params = self._get_sql_where()
        table = self.env['custom.accounting.report.selection']._table
        query = f"""
            SELECT
                COUNT(1) AS line_count,
                COALESCE(SUM(monto_fact_shipper), 0) AS total_shipper,
                COALESCE(SUM(monto_fact_transportista), 0) AS total_transportista
            FROM {table}
            {where_sql}
        """
        self.env.cr.execute(query, params)
        row = self.env.cr.fetchone() or (0, 0, 0)
        self.line_count = row[0] or 0
        self.total_monto_fact_shipper = row[1] or 0
        self.total_monto_fact_transportista = row[2] or 0

    def _ensure_report_data(self):
        self._ensure_selection_loaded()
        self._compute_report_stats()
        if not self.line_count:
            raise UserError(_('No se encontraron registros con los filtros seleccionados.'))

    def _get_report_lines(self):
        self.ensure_one()
        self._ensure_selection_loaded()
        return self.env['custom.accounting.report.selection'].search(
            self._get_report_domain(),
            order=self._get_report_order()
        )

    # -----------------------------
    # Acciones
    # -----------------------------
    def action_generate_report(self):
        self.ensure_one()
        self._ensure_report_data()

        if self.line_count > MAX_LINES_REDIRECT:
            return self.action_view_lines()

        return {
            'type': 'ir.actions.act_window',
            'name': _('Reporte Contable'),
            'res_model': 'custom.accounting.report.wizard',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
            'context': self.env.context,
        }

    def action_print_pdf(self):
        self.ensure_one()
        self._ensure_report_data()
        return self.env.ref('exo_api.action_report_accounting_pdf').report_action(self, data={
            'wizard_id': self.id,
        })

    def action_export_xlsx(self):
        self.ensure_one()
        self._ensure_report_data()
        return self.env.ref('exo_api.action_report_accounting_xlsx').report_action(self, data={
            'wizard_id': self.id,
        })

    def action_view_lines(self):
        self.ensure_one()
        self._ensure_report_data()

        return {
            'type': 'ir.actions.act_window',
            'name': _('Lineas del Reporte Contable'),
            'res_model': 'custom.accounting.report.selection',
            'view_mode': 'tree,pivot,graph',
            'domain': self._get_report_domain(),
            'context': self.env.context,
        }
