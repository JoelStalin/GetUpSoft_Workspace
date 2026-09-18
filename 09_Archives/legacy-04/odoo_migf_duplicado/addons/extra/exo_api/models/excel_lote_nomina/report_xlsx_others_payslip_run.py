# -*- coding: utf-8 -*-
from odoo import models, _
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)


class ReportPayslipRunOthersXlsx(models.AbstractModel):
    _name = 'report.exo_api.payslip_run_others_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    SHEET_NAME = 'transactio'
    HEADERS = [
        'Número de cuenta', 'Código Swift del Banco', 'Tipo de Cuenta',
        'Beneficiario', 'Tipo de movimiento', 'Monto', 'Número de referencia',
        'Descripción', 'Correo electrónico', 'Teléfono', 'Tipo de Identificación', 'No. de Identificación',
    ]
    NET_CODES = ['NET', 'NETO', 'NET_PAY', 'NETO_PAGAR', 'NETOAPAGAR']
    VALID_STATES = ('done', 'paid')

    def _get_lines_for_run(self, run):
        Line = self.env['hr.payslip.line']
        lines = Line.search([('payslip_run_id', '=', run.id)])
        if not lines:
            lines = Line.search([('slip_id.payslip_run_id', '=', run.id)])
        if not lines and run.name:
            lines = Line.search([('slip_id.payslip_run_id.name', '=', run.name)])
    
        _logger.info("↪️ Lote '%s' (ID %s): %s líneas encontradas | line_ids=%s | slip_ids=%s",
                     run.name or '', run.id, len(lines), lines.ids, lines.mapped('slip_id').ids)
    
        for l in lines:
            _logger.info("   • line_id=%s | slip=%s | emp=%s | rule=%s | code=%s | total=%s",
                         l.id,
                         l.slip_id.display_name,
                         l.slip_id.employee_id.display_name,
                         l.salary_rule_id.display_name if hasattr(l, 'salary_rule_id') else '',
                         (l.code or ''),
                         float(l.total or 0.0))
    
        return lines


    def _compute_amount(self, lines):
        codes = {c.upper() for c in (self.env.context.get('net_codes') or self.NET_CODES)}
        amount = sum(lines.filtered(lambda l: (l.code or '').upper() in codes).mapped('total'))
        if not amount:
            amount = sum(lines.filtered(lambda l: l.category_id and (l.category_id.code or '').upper() in {'NET', 'NETO'}).mapped('total'))
        if not amount:
            amount = sum(lines.mapped('total'))
        return float(amount or 0.0)

    def _normalize_id_type(self, document_type):
        doc = (document_type or '').strip().upper()
        if doc in ('CÉDULA', 'CEDULA'):
            return 'C'
        if doc == 'RNC':
            return 'R'
        return doc

    def _build_non_bhd_bank_cache(self, all_lines):
        partner_bank_map, partners_missing, seen = {}, {}, set()
        for slip in all_lines.mapped('slip_id'):
            if slip.state not in self.VALID_STATES:
                continue
            emp_partner = slip.employee_id.address_home_id
            if not emp_partner or emp_partner.id in seen or emp_partner.id in partner_bank_map or emp_partner.id in partners_missing:
                continue
            seen.add(emp_partner.id)
            bank = self.env['bank.account.dominicana'].search([('partner_id', '=', emp_partner.id), ('active', '=', True)], limit=1)
            bank_code = (bank.bank_code or '').upper() if bank else ''
            if bank and bank_code != 'BHD' and bank.account_number:
                partner_bank_map[emp_partner.id] = bank
            elif bank and bank_code == 'BHD' and bank.account_number:
                continue
            else:
                partners_missing[emp_partner.id] = emp_partner.name
        return partner_bank_map, partners_missing

    def generate_xlsx_report(self, workbook, data, runs):
        if not runs or runs._name != 'hr.payslip.run':
            raise ValidationError(_("Este reporte solo soporta Lotes de Nómina (hr.payslip.run)."))

        all_lines = self.env['hr.payslip.line']
        for run in runs:
            all_lines |= self._get_lines_for_run(run)
        if not all_lines:
            raise ValidationError(_("No se encontraron líneas de nómina para los lotes: %s") % ', '.join(runs.mapped('name')))

        partner_bank_map, partners_missing = self._build_non_bhd_bank_cache(all_lines)
        if partners_missing:
            names = '\n'.join(partners_missing.values())
            raise ValidationError(_("Los siguientes beneficiarios no tienen cuentas bancarias BHD configuradas:\n%s") % names)

        sheet = workbook.add_worksheet(self.SHEET_NAME)
        bold = workbook.add_format({'bold': True})
        for col, header in enumerate(self.HEADERS):
            sheet.write(0, col, header, bold)

        row = 1
        for run in runs:
            lines = self._get_lines_for_run(run)
            lines_by_slip = {}
            for line in lines:
                lines_by_slip.setdefault(line.slip_id, self.env['hr.payslip.line'])
                lines_by_slip[line.slip_id] |= line

            for slip, slip_lines in lines_by_slip.items():
                if slip.state not in self.VALID_STATES:
                    continue
                partner = slip.employee_id.address_home_id or (slip_lines.mapped('partner_id')[:1] and slip_lines.mapped('partner_id')[:1][0])
                bank = partner and partner_bank_map.get(partner.id)
                if not bank:
                    continue

                acc_number = bank.account_number or ''
                bank_bic = bank.swift_code or ''
                product_type = bank.account_type or ''
                acc_holder = bank.acc_holder_name or slip.employee_id.name or (slip_lines.mapped('employee_id')[:1] and slip_lines.mapped('employee_id')[:1][0].name) or ''
                amount = self._compute_amount(slip_lines)
                reference = slip.number or slip.name or ''
                description = slip.name or slip.employee_id.display_name or ''
                email = partner.email or ''
                phone = partner.phone or ''
                id_type_char = self._normalize_id_type(bank.document_type)
                vat = partner.vat or ''

                sheet.write(row, 0, acc_number)
                sheet.write(row, 1, bank_bic)
                sheet.write(row, 2, product_type)
                sheet.write(row, 3, acc_holder)
                sheet.write(row, 4, 'C')
                sheet.write_number(row, 5, amount)
                sheet.write(row, 6, '')
                sheet.write(row, 7, reference)
                sheet.write(row, 8, email)
                sheet.write(row, 9, phone)
                sheet.write(row, 10, id_type_char)
                sheet.write(row, 11, vat)
                row += 1
