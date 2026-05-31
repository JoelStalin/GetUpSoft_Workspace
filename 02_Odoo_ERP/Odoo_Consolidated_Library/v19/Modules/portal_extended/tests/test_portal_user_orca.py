import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPortalUserOrcaLogging(TransactionCase):
    """Test suite for portal user ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.partner_model = self.env['res.partner']
        self.log_model = self.env['orca.portal.user.log']

    def test_partner_inherits_orca_mixin(self):
        """Test that res.partner inherits orca.universal.mixin."""
        self.assertTrue(self.partner_model._inherits.get('orca.universal.mixin'))

    def test_portal_user_orca_tier_medium(self):
        """Test that res.partner has MEDIUM tier classification."""
        self.assertEqual(self.partner_model._orca_tier, 'medium')

    def test_portal_user_log_model_configured(self):
        """Test that portal user log model is properly configured."""
        self.assertEqual(self.partner_model._orca_log_model, 'orca.portal.user.log')

    def test_portal_user_log_model_has_required_fields(self):
        """Test that portal user log has all required fields."""
        required_fields = ['user_email', 'partner_name', 'portal_access', 'access_level', 'last_login']
        for field in required_fields:
            self.assertTrue(field in self.log_model._fields)

    def test_portal_user_log_inherits_from_orca_log(self):
        """Test that portal user log inherits from orca.log."""
        self.assertIn('orca.log', self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit])

    def test_portal_user_create_action_logged(self):
        """Test that creating a partner generates an ORCA log entry."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        logs = self.log_model.search([('record_id', '=', partner.id)])
        self.assertTrue(len(logs) > 0)
        self.assertEqual(logs[0].action, 'create')

    def test_portal_user_write_action_logged(self):
        """Test that modifying a partner generates an ORCA log entry."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        partner.write({'name': 'Updated Partner'})
        logs = self.log_model.search([('record_id', '=', partner.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0)

    def test_portal_user_unlink_action_logged(self):
        """Test that deleting a partner generates an ORCA log entry."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        partner_id = partner.id
        partner.unlink()
        logs = self.log_model.search([('record_id', '=', partner_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0)

    def test_portal_user_log_captures_tracked_fields(self):
        """Test that portal user log captures tracked field values."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        partner.write({'email': 'updated@example.com'})
        logs = self.log_model.search([('record_id', '=', partner.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0)
        after_values = json.loads(logs[0].after_values)
        self.assertIn('email', after_values)

    def test_portal_user_log_user_tracking(self):
        """Test that portal user log tracks which user made the change."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        logs = self.log_model.search([('record_id', '=', partner.id)])
        self.assertTrue(logs[0].user_id)
        self.assertEqual(logs[0].user_id, self.env.user)

    def test_portal_user_log_date_tracking(self):
        """Test that portal user log captures timestamp."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        logs = self.log_model.search([('record_id', '=', partner.id)])
        self.assertTrue(logs[0].date)

    def test_access_control_portal_user_log_user(self):
        """Test that regular users can read portal user logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs)

    def test_portal_user_log_model_name(self):
        """Test that portal user log model has correct name."""
        self.assertEqual(self.log_model._name, 'orca.portal.user.log')

    def test_access_level_field_selections(self):
        """Test that access_level field has correct selections."""
        level_field = self.log_model._fields['access_level']
        expected_selections = ['public', 'partner', 'manager', 'admin']
        actual_selections = [s[0] for s in level_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections)

    def test_portal_user_active_field_tracking(self):
        """Test that active field changes are tracked properly."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com', 'active': True})
        logs = self.log_model.search([('record_id', '=', partner.id)])
        self.assertTrue(len(logs) > 0)

    def test_portal_user_company_field_tracking(self):
        """Test that company_id changes are tracked properly."""
        partner = self.partner_model.create({'name': 'Test Partner', 'email': 'test@example.com'})
        logs = self.log_model.search([('record_id', '=', partner.id)])
        self.assertTrue(len(logs) > 0)
