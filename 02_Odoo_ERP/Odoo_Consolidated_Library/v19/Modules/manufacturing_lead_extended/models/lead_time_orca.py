from odoo import models, fields


class OrcaLeadTimeLog(models.Model):
    _name = 'orca.lead.time.log'
    _description = 'Manufacturing Lead Time ORCA Audit Log'
    _inherit = 'orca.log'

    product_name = fields.Char(string='Product Name', index=True)
    route_name = fields.Char(string='Route Name')
    lead_time_days = fields.Integer(string='Lead Time (Days)')
    procurement_method = fields.Selection([
        ('make_to_stock', 'Make to Stock'),
        ('make_to_order', 'Make to Order'),
        ('buy', 'Buy'),
    ], string='Procurement Method')
    lead_time_type = fields.Selection([
        ('customer_lead_time', 'Customer Lead Time'),
        ('supplier_lead_time', 'Supplier Lead Time'),
        ('manufacturing_lead_time', 'Manufacturing Lead Time'),
    ], string='Lead Time Type')
    effective_date = fields.Date(string='Effective Date')
    status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ], string='Status')


class ProductTemplate(models.Model):
    _inherit = ['product.template', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.lead.time.log'
    _orca_tracked_fields = ['name', 'route_ids', 'supply_method', 'produce_delay', 'type']
