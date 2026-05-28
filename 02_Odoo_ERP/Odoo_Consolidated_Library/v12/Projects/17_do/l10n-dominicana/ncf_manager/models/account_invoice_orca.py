# © 2015-2018 Eneldo Serrata <eneldo@marcos.do>
# © 2017-2018 Gustavo Valverde <gustavo@iterativo.do>

# This file is part of NCF Manager.

# NCF Manager is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

from odoo import models, fields


class OrcaAccountInvoiceLog(models.Model):
    _name = 'orca.account.invoice.log'
    _description = 'Account Invoice ORCA Audit Log'
    _inherit = 'orca.log'
    _table = 'account_invoice_orca_log'

    ncf = fields.Char(
        string='NCF Number',
        help='Fiscal receipt number'
    )
    invoice_state = fields.Char(
        string='Invoice State at Log Time',
        help='Invoice state when this log entry was created'
    )


class AccountInvoice(models.Model):
    _inherit = ['account.invoice', 'orca.audit.mixin.v12']

    _orca_tracked_fields = [
        'number',
        'reference',
        'state',
        'amount_total',
        'partner_id',
        'type',
    ]
    _orca_log_model = 'orca.account.invoice.log'
