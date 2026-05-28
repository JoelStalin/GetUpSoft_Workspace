from odoo import models, fields


class RNCSearchOrcaLog(models.Model):
    _name = 'l10n.do.rnc.search.orca.log'
    _description = 'l10n_do_rnc_search ORCA Audit Log'
    _inherit = 'orca.log'

    searched_rnc = fields.Char(string='Searched RNC')
    search_result = fields.Selection([
        ('found', 'Found'),
        ('not_found', 'Not Found'),
        ('error', 'Error'),
    ], string='Search Result')
    dgii_response = fields.Json(string='DGII Response')
    validation_status = fields.Char(string='Validation Status')


class RNCSearchResult(models.Model):
    """RNC search result with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant RNC validation fields without explicit configuration.
    """

    _name = 'l10n.do.rnc.search.result'
    _description = 'RNC Search Result'
    _inherit = 'orca.universal.mixin'

    rnc = fields.Char(string='RNC', required=True, index=True)
    legal_name = fields.Char(string='Legal Name')
    commercial_name = fields.Char(string='Commercial Name')
    status = fields.Char(string='Status')
    activity_type = fields.Char(string='Activity Type')
    registration_date = fields.Date(string='Registration Date')
    dgii_uuid = fields.Char(string='DGII UUID')
    last_validation_date = fields.Datetime(string='Last Validation Date', auto_now=True)
    validation_status = fields.Selection([
        ('valid', 'Valid'),
        ('invalid', 'Invalid'),
        ('expired', 'Expired'),
        ('unknown', 'Unknown'),
    ], string='Validation Status')

    # Tier classification: CRITICAL for DGII RNC validation
    # OrcaUniversalMixin will auto-select ~10 RNC-related fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'l10n.do.rnc.search.orca.log'
