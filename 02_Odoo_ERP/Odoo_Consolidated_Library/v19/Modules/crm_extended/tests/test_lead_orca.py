import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestLeadOrcaLogging(TransactionCase):
    """Test suite for CRM lead ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.lead_model = self.env['crm.lead']
        self.log_model = self.env['orca.lead.log']

    def test_lead_log_model_created(self):
        """Test that orca.lead.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.lead.log model should exist'
        )

    def test_lead_log_inherits_from_orca_log(self):
        """Test that lead log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Lead log should inherit from orca.log'
        )

    def test_lead_log_has_required_fields(self):
        """Test that lead log has all required fields."""
        required_fields = ['lead_name', 'contact_name', 'lead_status', 'lead_probability', 'lead_value', 'team_name']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Lead log should have {field} field'
            )

    def test_lead_log_model_name(self):
        """Test that lead log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.lead.log',
            'Lead log model name incorrect'
        )

    def test_create_lead_logs_action(self):
        """Test that creating a lead creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a lead should create one log entry'
        )

    def test_create_lead_log_action_is_create(self):
        """Test that the logged action for lead creation is create."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
        })
        log = self.log_model.search([('record_id', '=', lead.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new lead'
        )

    def test_write_lead_logs_action(self):
        """Test that writing to a lead creates an ORCA log entry."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
        })
        log_count_before = self.log_model.search_count([('record_id', '=', lead.id)])
        lead.write({'probability': 50.0})
        log_count_after = self.log_model.search_count([('record_id', '=', lead.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to lead should create a log entry'
        )

    def test_write_lead_log_action_is_write(self):
        """Test that the logged action for lead write is write."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
        })
        lead.write({'probability': 75.0})
        log = self.log_model.search([('record_id', '=', lead.id), ('action', '=', 'write')], limit=1)
        self.assertIsNotNone(
            log,
            'Log entry with action=write should exist'
        )

    def test_unlink_lead_logs_action(self):
        """Test that deleting a lead creates an ORCA log entry."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
        })
        lead_id = lead.id
        log_count_before = self.log_model.search_count([('record_id', '=', lead_id)])
        lead.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', lead_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking lead should create a log entry'
        )

    def test_lead_log_captures_lead_name(self):
        """Test that log captures lead name at time of action."""
        lead = self.lead_model.create({
            'name': 'Test Lead Name',
            'type': 'lead',
        })
        log = self.log_model.search([('record_id', '=', lead.id)], limit=1)
        self.assertEqual(
            log.lead_name,
            'Test Lead Name',
            'Log should capture lead name'
        )

    def test_lead_log_captures_lead_probability(self):
        """Test that log captures lead probability at time of action."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
            'probability': 60.0,
        })
        log = self.log_model.search([('record_id', '=', lead.id)], limit=1)
        self.assertEqual(
            log.lead_probability,
            60.0,
            'Log should capture lead probability'
        )

    def test_lead_log_lead_status_selections(self):
        """Test that lead log lead_status has correct selections."""
        lead_status_field = self.log_model._fields['lead_status']
        expected_selections = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
        actual_selections = [s[0] for s in lead_status_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in lead_status selections'
            )

    def test_access_control_lead_log_user(self):
        """Test that regular users can read lead logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Regular users should be able to read lead logs'
        )

    def test_lead_log_captures_lead_value(self):
        """Test that log captures expected revenue at time of action."""
        lead = self.lead_model.create({
            'name': 'Test Lead',
            'type': 'lead',
            'expected_revenue': 5000.0,
        })
        log = self.log_model.search([('record_id', '=', lead.id)], limit=1)
        self.assertEqual(
            log.lead_value,
            5000.0,
            'Log should capture expected revenue'
        )
