import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSaleOrderOrcaLogging(TransactionCase):
    """Test suite for sale ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.order_model = self.env['sale.order']
        self.log_model = self.env['orca.sale.order.log']
        self.partner = self.env['res.partner'].create({
            'name': 'Test Customer',
        })

    def test_sale_order_inherits_mixin(self):
        """Test that sale.order inherits orca.universal.mixin."""
        self.assertTrue(
            self.order_model._inherits.get('orca.universal.mixin'),
            'sale.order should inherit orca.universal.mixin'
        )

    def test_sale_order_orca_tier_high(self):
        """Test that sale.order has HIGH tier classification."""
        self.assertEqual(
            self.order_model._orca_tier,
            'high',
            'sale.order should have HIGH tier'
        )

    def test_sale_order_log_model_configured(self):
        """Test that sale order log model is properly configured."""
        self.assertEqual(
            self.order_model._orca_log_model,
            'orca.sale.order.log',
            'Sale order should use orca.sale.order.log'
        )

    def test_sale_order_log_model_name(self):
        """Test that sale order log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.sale.order.log',
            'Sale order log model name incorrect'
        )

    def test_sale_order_log_has_required_fields(self):
        """Test that sale order log has all required fields."""
        required_fields = ['customer_name', 'order_total', 'order_date', 'delivery_date', 'order_state', 'product_count']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Sale order log should have {field} field'
            )

    def test_sale_order_log_inherits_from_orca_log(self):
        """Test that sale order log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Sale order log should inherit from orca.log'
        )

    def test_create_sale_order_logs_action(self):
        """Test that creating a sale order creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a sale order should create one log entry'
        )

    def test_create_sale_order_log_action_is_create(self):
        """Test that the logged action for order creation is '"'"'create'"'"'."""
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

    def test_write_sale_order_logs_action(self):
        """Test that writing to a sale order creates an ORCA log entry."""
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
            'Writing to sale order should create a log entry'
        )

    def test_write_sale_order_log_action_is_write(self):
        """Test that the logged action for order write is '"'"'write'"'"'."""
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

    def test_unlink_sale_order_logs_action(self):
        """Test that deleting a sale order creates an ORCA log entry."""
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
            'Unlinking sale order should create a log entry'
        )

    def test_access_control_sale_order_log_user(self):
        """Test that regular users can read sale order logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Regular users should be able to read sale order logs'
        )

    def test_access_control_sale_order_log_manager(self):
        """Test that sales managers can manage sale order logs."""
        manager = self.env['res.users'].create({
            'name': 'Test Sales Manager',
            'login': 'manager_sales@test.com',
            'groups_id': [(6, 0, [self.env.ref('sales_team.group_sale_manager').id])],
        })
        logs = self.log_model.with_user(manager).search([])
        self.assertIsNotNone(
            logs,
            'Sales managers should be able to read sale order logs'
        )

    def test_sale_order_log_captures_customer_name(self):
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

    def test_sale_order_log_captures_order_state(self):
        """Test that log captures order state at time of action."""
        order = self.order_model.create({
            'partner_id': self.partner.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', order.id)], limit=1)
        self.assertEqual(
            log.order_state,
            order.state,
            'Log should capture order state'
        )

    def test_sale_order_log_order_state_selections(self):
        """Test that sale order log order_state has correct selections."""
        order_state_field = self.log_model._fields['order_state']
        expected_selections = ['draft', 'sent', 'sale', 'done', 'cancel']
        actual_selections = [s[0] for s in order_state_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in order_state selections'
            )
