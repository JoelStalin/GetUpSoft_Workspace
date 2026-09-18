# -*- coding: utf-8 -*-
from odoo import models, _
import logging

_logger = logging.getLogger(__name__)


class AccountingReportXlsx(models.AbstractModel):
    """Generador de reporte XLSX para el reporte contable personalizado."""
    _name = 'report.exo_api.report_accounting_xlsx'
    _inherit = 'report.report_xlsx.abstract'
    _description = 'Reporte Contable XLSX'

    def generate_xlsx_report(self, workbook, data, wizards):
        """Genera el archivo Excel con los datos del reporte."""
        for wizard in wizards:
            wizard._ensure_report_data()
            lines = wizard._get_report_lines()

            sheet = workbook.add_worksheet(_('Reporte Contable'))

            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4472C4',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': True,
            })

            title_format = workbook.add_format({
                'bold': True,
                'font_size': 14,
                'align': 'center',
                'valign': 'vcenter',
            })

            subtitle_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'left',
            })

            money_format = workbook.add_format({
                'num_format': '#,##0.00',
                'border': 1,
                'align': 'right',
            })

            date_format = workbook.add_format({
                'num_format': 'dd/mm/yyyy',
                'border': 1,
                'align': 'center',
            })

            text_format = workbook.add_format({
                'border': 1,
                'align': 'left',
            })

            center_format = workbook.add_format({
                'border': 1,
                'align': 'center',
            })

            total_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D9E1F2',
                'num_format': '#,##0.00',
                'border': 1,
                'align': 'right',
            })

            total_label_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D9E1F2',
                'border': 1,
                'align': 'right',
            })

            columns = [
                {'header': _('Id_carga'), 'field': 'id_carga', 'width': 15, 'format': 'text'},
                {'header': _('No_Carga'), 'field': 'no_carga', 'width': 12, 'format': 'text'},
                {'header': _('Shipper'), 'field': 'shipper', 'width': 20, 'format': 'text'},
                {'header': _('Transportista'), 'field': 'transportista', 'width': 20, 'format': 'text'},
                {'header': _('Estatus_carga'), 'field': 'estatus_carga', 'width': 15, 'format': 'text'},
                {'header': _('Fact_shipper'), 'field': 'fact_shipper', 'width': 18, 'format': 'text'},
                {'header': _('Fact_transportista'), 'field': 'fact_transportista', 'width': 18, 'format': 'text'},
                {'header': _('Monto_fact_shipper'), 'field': 'monto_fact_shipper', 'width': 16, 'format': 'money'},
                {'header': _('Monto_fact_transportista'), 'field': 'monto_fact_transportista', 'width': 18, 'format': 'money'},
                {'header': _('Bloque'), 'field': 'bloque', 'width': 12, 'format': 'text'},
                {'header': _('Fecha_carga'), 'field': 'fecha_carga', 'width': 14, 'format': 'date'},
                {'header': _('Fecha_factura'), 'field': 'fecha_factura', 'width': 14, 'format': 'date'},
                {'header': _('Warehouse'), 'field': 'warehouse', 'width': 15, 'format': 'text'},
                {'header': _('Estatus_fact_shipper'), 'field': 'estatus_fact_shipper', 'width': 18, 'format': 'text'},
                {'header': _('Estatus_fact_transportista'), 'field': 'estatus_fact_transportista', 'width': 22, 'format': 'text'},
                {'header': _('Tipo_de_facturacion'), 'field': 'tipo_de_facturacion', 'width': 18, 'format': 'text'},
            ]

            fmt_by_type = {
                'date': date_format,
                'money': money_format,
                'center': center_format,
                'text': text_format,
            }

            last_col = max(len(columns) - 1, 0)
            sheet.merge_range(0, 0, 0, last_col, _('REPORTE CONTABLE PERSONALIZADO'), title_format)
            sheet.merge_range(1, 0, 1, last_col, wizard.company_id.name, subtitle_format)
            sheet.write(2, 0, _('Periodo:'), subtitle_format)
            sheet.write(2, 1, f"{wizard.date_from.strftime('%d/%m/%Y')} - {wizard.date_to.strftime('%d/%m/%Y')}")

            row = 5
            for col, column in enumerate(columns):
                sheet.write(row, col, column['header'], header_format)
                sheet.set_column(col, col, column['width'], fmt_by_type[column['format']])

            row += 1
            for line in lines:
                row_values = []
                for column in columns:
                    value = getattr(line, column['field'], '')
                    if value is False:
                        value = ''
                    if column['format'] == 'money':
                        value = float(value or 0)
                    row_values.append(value if value is not None else '')
                sheet.write_row(row, 0, row_values)
                row += 1

            row += 1
            shipper_col = next((i for i, c in enumerate(columns) if c['field'] == 'monto_fact_shipper'), None)
            transport_col = next((i for i, c in enumerate(columns) if c['field'] == 'monto_fact_transportista'), None)

            if shipper_col is not None:
                sheet.write(row, shipper_col - 1, _('TOTALES:'), total_label_format)
                sheet.write_number(row, shipper_col, wizard.total_monto_fact_shipper, total_format)
            if transport_col is not None:
                sheet.write_number(row, transport_col, wizard.total_monto_fact_transportista, total_format)

            sheet.freeze_panes(6, 0)
            sheet.autofilter(5, 0, row - 1, len(columns) - 1)
