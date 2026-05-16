# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

BANK_DATA = {
    'BRR': {'swift': 'BRRDDOSDXXX', 'name': 'Banco de Reservas (BRR)'},
    'BPD': {'swift': 'BPDODOSXXXX', 'name': 'Banco Popular Dominicano (BPD)'},
    'BHD': {'swift': 'BCBHDOSDXXX', 'name': 'BANCO MULTIPLE BHD (BHD)'},
    'SCR': {'swift': 'SCRZDOSDXXX', 'name': 'Banco Santa Cruz (SCR)'},
    'SCO': {'swift': 'NOSCDOSDXXX', 'name': 'Banco ScotiaBank (SCO)'},
    'PRM': {'swift': 'PRHRDOSDXXX', 'name': 'Promerica (PRM)'},
    'BAN': {'swift': 'BANSDOSDXXX', 'name': 'Banco Ademi (BAN)'},
    'CAR': {'swift': 'STGODOSDXXX', 'name': 'Banco Caribe (CAR)'},
    'BDI': {'swift': 'BBDIDOSDXXX', 'name': 'Banco BDI (BDI)'},
    'BLH': {'swift': 'BLDHDOSDXXX', 'name': 'Banco López de Haro (BLH)'},
    'CIT': {'swift': 'CITIDOSDXXX', 'name': 'CitiBank (CIT)'},
    'VIM': {'swift': 'VIMEDOSDXXX', 'name': 'Banco Vimenca (VIM)'},
    'ADE': {'swift': 'AHCMDOSDXXX', 'name': 'Banco Adopem (ADE)'},
    'LAF': {'swift': 'BCCEDOSDXXX', 'name': 'Banco Lafise (LAF)'},
    'JMM': {'swift': 'AHRIDOS2XXX', 'name': 'Banco JMMB (JMM)'},
    'QIK': {'swift': 'QDDMDOSDXXX', 'name': 'Banco Qik (QIK)'},
    'BAG': {'swift': 'BAGRDOSAXXX', 'name': 'Banco Agrícola (BAG)'},
    'ACF': {'swift': 'ACFEDOSCXXX', 'name': 'Banco ACF (ACF)'},
    'BEL': {'swift': 'BELNDOSDXXX', 'name': 'Banco BellBank (BEL)'},
    'CFC': {'swift': 'AHCCDOS2XXX', 'name': 'Confisa (CFC)'},
    'CFS': {'swift': 'AHCODOSMXXX', 'name': 'Confisa Servicios (CFS)'},
    'FIH': {'swift': 'AHCGDOS3XXX', 'name': 'Fihellbank (FIH)'},
    'GRU': {'swift': 'BACGDOS1XXX', 'name': 'Grupo Financiero (GRU)'},
}


class HrEmployeeBankAccount(models.Model):
    _name = 'hr.employee.bank.account'
    _description = 'Cuenta Bancaria Dominicana (Empleado)'
    _rec_name = 'account_number'
    _order = 'employee_id, account_number'

    employee_id = fields.Many2one('hr.employee', string='Empleado', required=True, ondelete='cascade')
    account_number = fields.Char(string='Número de Cuenta', required=True)
    acc_holder_name = fields.Char(string='Titular / Alias', required=True)
    active = fields.Boolean(string="Activo", default=True)

    account_type = fields.Selection(
        selection=[
            ('CA', 'Cuenta de Ahorro'),
            ('CC', 'Cuenta Corriente'),
            ('PR', 'Préstamo'),
            ('TJ', 'Tarjeta de Crédito')
        ],
        string="Tipo de Producto", required=True,
    )

    transfer_type = fields.Selection(
        selection=[
            ('1', 'Cuentas de Tercero en el BHD León'),
            ('2', 'Tarjetas terceros en BHD León'),
            ('3', 'Préstamos terceros en BHD León'),
            ('4', 'ACH'),
            ('5', 'Pago al Instante')
        ],
        default='5',
        string="Tipo de Transacción",
    )

    bank_code = fields.Char(string='Código de Banco', required=True)
    swift_code = fields.Char(string='Código SWIFT', required=True)
    bank_name = fields.Char(string='Nombre del Banco')

    document_type = fields.Char(string='Tipo de Documento', compute='_compute_document_type', store=True)
    document_number = fields.Char(string='Documento', related='employee_id.identification_id', store=True)

    _sql_constraints = [
        (
            'unique_account_per_employee',
            'UNIQUE(employee_id, account_number)',
            'El número de cuenta ya está registrado para este empleado.'
        ),
    ]

    @api.depends('employee_id')
    def _compute_document_type(self):
        for record in self:
            doc = record.employee_id.identification_id
            if doc:
                vat_len = len(doc)
                if vat_len == 9:
                    record.document_type = 'R'
                elif vat_len == 11:
                    record.document_type = 'C'
                else:
                    record.document_type = 'P'
            else:
                record.document_type = 'N'

    @api.onchange('bank_code')
    def _onchange_bank_code(self):
        if self.bank_code:
            bank_info = BANK_DATA.get(self.bank_code)
            if bank_info:
                swift = bank_info['swift']
                if len(swift) < 11:
                    swift = swift.ljust(11, 'X')
                self.swift_code = swift
                self.bank_name = bank_info['name']
            else:
                self.swift_code = ''
                self.bank_name = ''

    @api.onchange('bank_code', 'employee_id')
    def _onchange_bank_code_or_employee_id(self):
        self._onchange_bank_code()

        if self.bank_code and self.employee_id:
            if self.bank_code != 'BHD':
                self.acc_holder_name = self.employee_id.name
            else:
                self.acc_holder_name = ''
        else:
            self.acc_holder_name = ''

    def action_actualizar_acc_holder_name(self):
        cuentas = self.env['hr.employee.bank.account'].search([])
        for cuenta in cuentas:
            if cuenta.bank_code and cuenta.employee_id:
                if cuenta.bank_code != 'BHD':
                    cuenta.acc_holder_name = cuenta.employee_id.name
                elif cuenta.bank_code == 'BHD':
                    cuenta.transfer_type = '1'
                    cuenta.acc_holder_name = cuenta.acc_holder_name
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Actualización Completa'),
                'message': _('Se actualizaron los Titulares/Alias correctamente.'),
                'type': 'success',
                'sticky': False,
            }
        }
