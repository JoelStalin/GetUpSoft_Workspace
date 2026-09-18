import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestManufacturingOrderOrcaLogging(TransactionCase):
    """Test suite for manufacturing order ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.mo_model = self.env['mrp.production']
        self.log_model = self.env['orca.manufacturing.order.log']
        self.product = self.env['product.product'].create({
            'name': 'Test Manufacturing Product',
            'type': 'product',
        })

    def test_manufacturing_order_log_model_created(self):
        """Test that orca.manufacturing.order.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.manufacturing.order.log model should exist'
        )

    def test_manufacturing_order_log_inherits_from_orca_log(self):
        """Test that manufacturing order log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Manufacturing order log should inherit from orca.log'
        )

    def test_manufacturing_order_log_has_required_fields(self):
        """Test that manufacturing order log has all required fields."""
        required_fields = ['mo_reference', 'product_name', 'mo_status', 'quantity_to_produce', 'quantity_produced', 'bom_id']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Manufacturing order log should have {field} field'
            )

    def test_create_manufacturing_order_logs_action(self):
        """Test that creating a manufacturing order creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a manufacturing order should create one log entry'
        )

    def test_create_manufacturing_order_log_action_is_create(self):
        """Test that the logged action for MO creation is create."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        log = self.log_model.search([('record_id', '=', mo.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new MO'
        )

    def test_write_manufacturing_order_logs_action(self):
        """Test that writing to a manufacturing order creates an ORCA log entry."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        log_count_before = self.log_model.search_count([('record_id', '=', mo.id)])
        mo.write({'state': 'progress'})
        log_count_after = self.log_model.search_count([('record_id', '=', mo.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to manufacturing order should create a log entry'
        )

    def test_unlink_manufacturing_order_logs_action(self):
        """Test that deleting a manufacturing order creates an ORCA log entry."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        mo_id = mo.id
        log_count_before = self.log_model.search_count([('record_id', '=', mo_id)])
        mo.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', mo_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking manufacturing order should create a log entry'
        )

    def test_manufacturing_order_log_captures_product_name(self):
        """Test that log captures product name at time of action."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        log = self.log_model.search([('record_id', '=', mo.id)], limit=1)
        self.assertEqual(
            log.product_name,
            'Test Manufacturing Product',
            'Log should capture product name'
        )

    def test_manufacturing_order_log_captures_quantity(self):
        """Test that log captures quantity to produce."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 250,
        })
        log = self.log_model.search([('record_id', '=', mo.id)], limit=1)
        self.assertEqual(
            log.quantity_to_produce,
            250,
            'Log should capture quantity to produce'
        )

    def test_manufacturing_order_log_mo_status_selections(self):
        """Test that manufacturing order log mo_status has correct selections."""
        mo_status_field = self.log_model._fields['mo_status']
        expected_selections = ['draft', 'confirmed', 'progress', 'done', 'cancel']
        actual_selections = [s[0] for s in mo_status_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in mo_status selections'
            )

    def test_access_control_manufacturing_order_log_user(self):
        """Test that users can read manufacturing order logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Users should be able to read manufacturing order logs'
        )

    def test_manufacturing_order_log_captures_mo_reference(self):
        """Test that log captures MO reference."""
        mo = self.mo_model.create({
            'name': 'Test MO Reference',
            'product_id': self.product.id,
            'product_qty': 100,
        })
        log = self.log_model.search([('record_id', '=', mo.id)], limit=1)
        self.assertIsNotNone(
            log.mo_reference,
            'Log should capture MO reference'
        )

    def test_manufacturing_order_log_captures_quantity_produced(self):
        """Test that log captures quantity produced."""
        mo = self.mo_model.create({
            'name': 'Test MO',
            'product_id': self.product.id,
            'product_qty': 100,
            'qty_produced': 50,
        })
        log = self.log_model.search([('record_id', '=', mo.id)], limit=1)
        self.assertEqual(
            log.quantity_produced,
            50,
            'Log should capture quantity produced'
        )

    def test_manufacturing_order_log_model_name(self):
        """Test that manufacturing order log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.manufacturing.order.log',
            'Manufacturing order log model name incorrect'
        )
