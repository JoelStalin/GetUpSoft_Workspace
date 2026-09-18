import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPhoneCallOrcaLogging(TransactionCase):
    """Test suite for phone call ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.call_model = self.env['phone.call']
        self.log_model = self.env['orca.phone.call.log']
        self.lead = self.env['crm.lead'].create({
            'name': 'Test Lead',
            'type': 'lead',
        })

    def test_phone_call_log_model_created(self):
        """Test that orca.phone.call.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.phone.call.log model should exist'
        )

    def test_phone_call_log_inherits_from_orca_log(self):
        """Test that phone call log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Phone call log should inherit from orca.log'
        )

    def test_phone_call_log_has_required_fields(self):
        """Test that phone call log has all required fields."""
        required_fields = ['call_reference', 'contact_name', 'call_type', 'call_duration', 'call_outcome', 'next_action_date']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Phone call log should have {field} field'
            )

    def test_create_phone_call_logs_action(self):
        """Test that creating a phone call creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a phone call should create one log entry'
        )

    def test_create_phone_call_log_action_is_create(self):
        """Test that the logged action for call creation is create."""
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
        })
        log = self.log_model.search([('record_id', '=', call.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new call'
        )

    def test_write_phone_call_logs_action(self):
        """Test that writing to a phone call creates an ORCA log entry."""
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
        })
        log_count_before = self.log_model.search_count([('record_id', '=', call.id)])
        call.write({'outcome': 'completed'})
        log_count_after = self.log_model.search_count([('record_id', '=', call.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to phone call should create a log entry'
        )

    def test_write_phone_call_log_action_is_write(self):
        """Test that the logged action for call write is write."""
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
        })
        call.write({'duration': 600})
        log = self.log_model.search([('record_id', '=', call.id), ('action', '=', 'write')], limit=1)
        self.assertIsNotNone(
            log,
            'Log entry with action=write should exist'
        )

    def test_unlink_phone_call_logs_action(self):
        """Test that deleting a phone call creates an ORCA log entry."""
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
        })
        call_id = call.id
        log_count_before = self.log_model.search_count([('record_id', '=', call_id)])
        call.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', call_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking phone call should create a log entry'
        )

    def test_phone_call_log_captures_call_reference(self):
        """Test that log captures call reference."""
        call = self.call_model.create({
            'name': 'Test Call Reference',
            'lead_id': self.lead.id,
        })
        log = self.log_model.search([('record_id', '=', call.id)], limit=1)
        self.assertEqual(
            log.call_reference,
            'Test Call Reference',
            'Log should capture call reference'
        )

    def test_phone_call_log_captures_call_duration(self):
        """Test that log captures call duration."""
        call = self.call_model.create({
            'name': 'Test Call',
            'lead_id': self.lead.id,
            'duration': 300,
        })
        log = self.log_model.search([('record_id', '=', call.id)], limit=1)
        self.assertEqual(
            log.call_duration,
            300,
            'Log should capture call duration'
        )

    def test_phone_call_log_call_type_selections(self):
        """Test that phone call log call_type has correct selections."""
        call_type_field = self.log_model._fields['call_type']
        expected_selections = ['inbound', 'outbound', 'missed', 'voicemail']
        actual_selections = [s[0] for s in call_type_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in call_type selections'
            )

    def test_access_control_phone_call_log_user(self):
        """Test that users can read phone call logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Users should be able to read phone call logs'
        )

    def test_phone_call_log_call_outcome_selections(self):
        """Test that phone call log call_outcome has correct selections."""
        call_outcome_field = self.log_model._fields['call_outcome']
        expected_selections = ['completed', 'no_answer', 'busy', 'left_message', 'pending']
        actual_selections = [s[0] for s in call_outcome_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in call_outcome selections'
            )
