import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPurchaseOrderOrcaLogging(TransactionCase):
    """Test suite for purchase order ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.order_model = self.env['purchase.order']
        self.log_model = self.env['orca.purchase.order.log']
        self.vendor = self.env['res.partner'].create({
            'name': 'Test Vendor',
            'is_company': True,
        })

    def test_purchase_order_log_model_created(self):
        """Test that orca.purchase.order.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.purchase.order.log model should exist'
        )

    def test_purchase_order_log_inherits_from_orca_log(self):
        """Test that purchase order log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Purchase order log should inherit from orca.log'
        )

    def test_purchase_order_log_has_required_fields(self):
        """Test that purchase order log has all required fields."""
        required_fields = ['po_reference', 'vendor_name', 'po_status', 'order_date', 'order_amount', 'line_count']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Purchase order log should have {field} field'
            )

    def test_create_purchase_order_logs_action(self):
        """Test that creating a purchase order creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a purchase order should create one log entry'
        )

    def test_create_purchase_order_log_action_is_create(self):
        """Test that the logged action for order creation is create."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', po.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new order'
        )

    def test_write_purchase_order_logs_action(self):
        """Test that writing to a purchase order creates an ORCA log entry."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log_count_before = self.log_model.search_count([('record_id', '=', po.id)])
        po.write({'state': 'purchase'})
        log_count_after = self.log_model.search_count([('record_id', '=', po.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to purchase order should create a log entry'
        )

    def test_unlink_purchase_order_logs_action(self):
        """Test that deleting a purchase order creates an ORCA log entry."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        po_id = po.id
        log_count_before = self.log_model.search_count([('record_id', '=', po_id)])
        po.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', po_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking purchase order should create a log entry'
        )

    def test_purchase_order_log_captures_vendor_name(self):
        """Test that log captures vendor name at time of action."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', po.id)], limit=1)
        self.assertEqual(
            log.vendor_name,
            'Test Vendor',
            'Log should capture vendor name'
        )

    def test_purchase_order_log_captures_po_status(self):
        """Test that log captures PO status at time of action."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', po.id)], limit=1)
        self.assertEqual(
            log.po_status,
            po.state,
            'Log should capture PO status'
        )

    def test_purchase_order_log_po_status_selections(self):
        """Test that purchase order log po_status has correct selections."""
        po_status_field = self.log_model._fields['po_status']
        expected_selections = ['draft', 'sent', 'to approve', 'purchase', 'done', 'cancel']
        actual_selections = [s[0] for s in po_status_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in po_status selections'
            )

    def test_access_control_purchase_order_log_user(self):
        """Test that users can read purchase order logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Users should be able to read purchase order logs'
        )

    def test_purchase_order_log_captures_order_amount(self):
        """Test that log captures order amount."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', po.id)], limit=1)
        self.assertEqual(
            log.order_amount,
            po.amount_total,
            'Log should capture order amount'
        )

    def test_purchase_order_log_captures_po_reference(self):
        """Test that log captures PO reference."""
        po = self.order_model.create({
            'partner_id': self.vendor.id,
            'order_line': [],
        })
        log = self.log_model.search([('record_id', '=', po.id)], limit=1)
        self.assertIsNotNone(
            log.po_reference,
            'Log should capture PO reference'
        )

    def test_purchase_order_log_model_name(self):
        """Test that purchase order log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.purchase.order.log',
            'Purchase order log model name incorrect'
        )
