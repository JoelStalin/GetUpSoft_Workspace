import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestECommerceOrderOrcaLogging(TransactionCase):
    """Test suite for e-commerce order ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.order_model = self.env['sale.order']
        self.log_model = self.env['orca.ecommerce.order.log']
        self.partner = self.env['res.partner'].create({
            'name': 'E-Commerce Customer',
            'email': 'customer@example.com',
        })

    def test_ecommerce_log_model_created(self):
        """Test that orca.ecommerce.order.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.ecommerce.order.log model should exist'
        )

    def test_ecommerce_log_inherits_from_orca_log(self):
        """Test that e-commerce log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'E-commerce log should inherit from orca.log'
        )

    def test_ecommerce_log_has_required_fields(self):
        """Test that e-commerce log has all required fields."""
        required_fields = ['order_reference', 'customer_email', 'order_status', 'order_date', 'order_total', 'item_count']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'E-commerce log should have {field} field'
            )

    def test_create_ecommerce_order_logs_action(self):
        """Test that creating an e-commerce order creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating an e-commerce order should create one log entry'
        )

    def test_create_ecommerce_order_log_action_is_create(self):
        """Test that the logged action for order creation is create."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new order'
        )

    def test_write_ecommerce_order_logs_action(self):
        """Test that writing to an e-commerce order creates an ORCA log entry."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log_count_before = self.log_model.search_count([('record_id', '=', order.id)])
        order.write({'state': 'sale'})
        log_count_after = self.log_model.search_count([('record_id', '=', order.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to e-commerce order should create a log entry'
        )

    def test_unlink_ecommerce_order_logs_action(self):
        """Test that deleting an e-commerce order creates an ORCA log entry."""
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
            'Unlinking e-commerce order should create a log entry'
        )

    def test_ecommerce_log_captures_customer_email(self):
        """Test that log captures customer email at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.customer_email,
            'customer@example.com',
            'Log should capture customer email'
        )

    def test_ecommerce_log_captures_order_total(self):
        """Test that log captures order total at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.order_total,
            order.amount_total,
            'Log should capture order total'
        )

    def test_ecommerce_log_order_status_selections(self):
        """Test that e-commerce log order_status has correct selections."""
        order_status_field = self.log_model._fields['order_status']
        expected_selections = ['draft', 'sent', 'sale', 'shipped', 'delivered', 'cancelled']
        actual_selections = [s[0] for s in order_status_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in order_status selections'
            )

    def test_access_control_ecommerce_order_log_user(self):
        """Test that users can read e-commerce order logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Users should be able to read e-commerce order logs'
        )

    def test_ecommerce_log_captures_order_reference(self):
        """Test that log captures order reference."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertIsNotNone(
            log.order_reference,
            'Log should capture order reference'
        )
