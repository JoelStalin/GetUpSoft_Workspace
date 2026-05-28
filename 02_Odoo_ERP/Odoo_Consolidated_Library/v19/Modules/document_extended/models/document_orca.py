from odoo import models, fields

class OrcaDocumentLog(models.Model):
    _name = 'orca.document.log'
    _description = 'Document ORCA Audit Log'
    _inherit = 'orca.log'
    doc_name = fields.Char(string='Document Name')
    doc_type = fields.Char(string='Document Type')
    file_size = fields.Integer(string='File Size')
    owner_id = fields.Char(string='Owner ID')

class IrAttachment(models.Model):
    _inherit = ['ir.attachment', 'orca.universal.mixin']
    _orca_tier = 'medium'
    _orca_log_model = 'orca.document.log'
    _orca_tracked_fields = ['name', 'type', 'file_size', 'create_uid', 'res_id']
