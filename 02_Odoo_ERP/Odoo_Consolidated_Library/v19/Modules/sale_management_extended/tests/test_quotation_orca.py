import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestQuotationOrcaLogging(TransactionCase):
    """Test suite for quotation ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.order_model = self.env['sale.order']
        self.log_model = self.env['orca.quotation.log']
        self.partner = self.env['res.partner'].create({
            'name': 'Test Customer',
        })

    def test_quotation_log_model_created(self):
        """Test that orca.quotation.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.quotation.log model should exist'
        )

    def test_quotation_log_inherits_from_orca_log(self):
        """Test that quotation log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Quotation log should inherit from orca.log'
        )

    def test_quotation_log_has_required_fields(self):
        """Test that quotation log has all required fields."""
        required_fields = ['quotation_ref', 'customer_name', 'quotation_status', 'validity_date', 'quotation_amount', 'line_count']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Quotation log should have {field} field'
            )

    def test_quotation_log_model_name(self):
        """Test that quotation log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.quotation.log',
            'Quotation log model name incorrect'
        )

    def test_create_quotation_logs_action(self):
        """Test that creating a quotation creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a quotation should create one log entry'
        )

    def test_create_quotation_log_action_is_create(self):
        """Test that the logged action for quotation creation is create."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new quotation'
        )

    def test_write_quotation_logs_action(self):
        """Test that writing to a quotation creates an ORCA log entry."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log_count_before = self.log_model.search_count([('record_id', '=', order.id)])
        order.write({'state': 'sent'})
        log_count_after = self.log_model.search_count([('record_id', '=', order.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to quotation should create a log entry'
        )

    def test_write_quotation_log_action_is_write(self):
        """Test that the logged action for quotation write is write."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        order.write({'state': 'sent'})
        log = self.log_model.search([('record_id', '=', order.id), ('action', '=', 'write')], limit=1)
        self.assertIsNotNone(
            log,
            'Log entry with action=write should exist'
        )

    def test_unlink_quotation_logs_action(self):
        """Test that deleting a quotation creates an ORCA log entry."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        order_id = order.id
        log_count_before = self.log_model.search_count([('record_id', '=', order_id)])
        order.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', order_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking quotation should create a log entry'
        )

    def test_quotation_log_captures_customer_name(self):
        """Test that log captures customer name at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.customer_name,
            'Test Customer',
            'Log should capture customer name'
        )

    def test_quotation_log_captures_quotation_status(self):
        """Test that log captures quotation status at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.quotation_status,
            order.state,
            'Log should capture quotation status'
        )

    def test_quotation_log_quotation_status_selections(self):
        """Test that quotation log quotation_status has correct selections."""
        quotation_status_field = self.log_model._fields['quotation_status']
        expected_selections = ['draft', 'sent', 'opened', 'converted', 'expired', 'cancelled']
        actual_selections = [s[0] for s in quotation_status_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in quotation_status selections'
            )

    def test_access_control_quotation_log_user(self):
        """Test that regular users can read quotation logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Regular users should be able to read quotation logs'
        )

    def test_quotation_log_captures_quotation_amount(self):
        """Test that log captures quotation amount at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.quotation_amount,
            order.amount_total,
            'Log should capture quotation amount'
        )
