import json
from odoo.tests import TransactionCase, tagged

@tagged('post_install', '-at_install')
class TestCalendarEventOrcaLogging(TransactionCase):
    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.event_model = self.env['calendar.event']
        self.log_model = self.env['orca.calendar.event.log']

    def test_calendar_event_inherits_orca_mixin(self):
        self.assertTrue(self.event_model._inherits.get('orca.universal.mixin'))

    def test_calendar_event_orca_tier_medium(self):
        self.assertEqual(self.event_model._orca_tier, 'medium')

    def test_calendar_event_log_model_configured(self):
        self.assertEqual(self.event_model._orca_log_model, 'orca.calendar.event.log')

    def test_calendar_event_log_model_has_required_fields(self):
        required_fields = ['event_title', 'event_date', 'organizer', 'attendees_count', 'event_type']
        for field in required_fields:
            self.assertTrue(field in self.log_model._fields)

    def test_calendar_event_log_inherits_from_orca_log(self):
        self.assertIn('orca.log', self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit])

    def test_calendar_event_create_action_logged(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        logs = self.log_model.search([('record_id', '=', event.id)])
        self.assertTrue(len(logs) > 0 and logs[0].action == 'create')

    def test_calendar_event_write_action_logged(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        event.write({'name': 'Updated Event'})
        logs = self.log_model.search([('record_id', '=', event.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0)

    def test_calendar_event_unlink_action_logged(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        event_id = event.id
        event.unlink()
        logs = self.log_model.search([('record_id', '=', event_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0)

    def test_calendar_event_log_captures_tracked_fields(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        event.write({'name': 'Updated Event'})
        logs = self.log_model.search([('record_id', '=', event.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0)
        after_values = json.loads(logs[0].after_values)
        self.assertIn('name', after_values)

    def test_calendar_event_log_user_tracking(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        logs = self.log_model.search([('record_id', '=', event.id)])
        self.assertTrue(logs[0].user_id and logs[0].user_id == self.env.user)

    def test_calendar_event_log_date_tracking(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        logs = self.log_model.search([('record_id', '=', event.id)])
        self.assertTrue(logs[0].date)

    def test_access_control_calendar_event_log_user(self):
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs)

    def test_calendar_event_log_model_name(self):
        self.assertEqual(self.log_model._name, 'orca.calendar.event.log')

    def test_event_type_field_selections(self):
        type_field = self.log_model._fields['event_type']
        expected_selections = ['meeting', 'task', 'call', 'other']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections)

    def test_calendar_event_start_tracking(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        logs = self.log_model.search([('record_id', '=', event.id)])
        self.assertTrue(len(logs) > 0)

    def test_calendar_event_user_id_tracking(self):
        event = self.event_model.create({'name': 'Test Event', 'start': '2026-05-28 10:00:00'})
        event.write({'user_id': self.env.ref('base.user_demo').id})
        logs = self.log_model.search([('record_id', '=', event.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0)
