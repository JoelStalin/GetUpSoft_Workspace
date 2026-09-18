import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestStockMoveOrcaLogging(TransactionCase):
    """Test suite for stock move ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.move_model = self.env['stock.move']
        self.log_model = self.env['orca.stock.move.log']
        self.product = self.env['product.product'].create({
            'name': 'Test Product',
            'type': 'product',
        })
        self.location_src = self.env['stock.location'].search([('usage', '=', 'internal')], limit=1)
        self.location_dst = self.env['stock.location'].search([('usage', '=', 'internal')], limit=1)

    def test_stock_move_log_model_created(self):
        """Test that orca.stock.move.log model exists."""
        self.assertTrue(
            self.log_model,
            'orca.stock.move.log model should exist'
        )

    def test_stock_move_log_inherits_from_orca_log(self):
        """Test that stock move log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Stock move log should inherit from orca.log'
        )

    def test_stock_move_log_has_required_fields(self):
        """Test that stock move log has all required fields."""
        required_fields = ['product_name', 'move_type', 'quantity_moved', 'source_location', 'destination_location', 'reference']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Stock move log should have {field} field'
            )

    def test_create_stock_move_logs_action(self):
        """Test that creating a stock move creates an ORCA log entry."""
        initial_count = self.log_model.search_count([])
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        final_count = self.log_model.search_count([])
        self.assertEqual(
            final_count,
            initial_count + 1,
            'Creating a stock move should create one log entry'
        )

    def test_create_stock_move_log_action_is_create(self):
        """Test that the logged action for move creation is create."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        log = self.log_model.search([('record_id', '=', move.id)], limit=1)
        self.assertEqual(
            log.action,
            'create',
            'Log action should be create for new move'
        )

    def test_write_stock_move_logs_action(self):
        """Test that writing to a stock move creates an ORCA log entry."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        log_count_before = self.log_model.search_count([('record_id', '=', move.id)])
        move.write({'quantity_done': 5})
        log_count_after = self.log_model.search_count([('record_id', '=', move.id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Writing to stock move should create a log entry'
        )

    def test_unlink_stock_move_logs_action(self):
        """Test that deleting a stock move creates an ORCA log entry."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        move_id = move.id
        log_count_before = self.log_model.search_count([('record_id', '=', move_id)])
        move.unlink()
        log_count_after = self.log_model.search_count([('record_id', '=', move_id)])
        self.assertGreater(
            log_count_after,
            log_count_before,
            'Unlinking stock move should create a log entry'
        )

    def test_stock_move_log_captures_product_name(self):
        """Test that log captures product name at time of action."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        log = self.log_model.search([('record_id', '=', move.id)], limit=1)
        self.assertEqual(
            log.product_name,
            'Test Product',
            'Log should capture product name'
        )

    def test_stock_move_log_captures_quantity(self):
        """Test that log captures quantity moved."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 25,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
            'quantity_done': 25,
        })
        log = self.log_model.search([('record_id', '=', move.id)], limit=1)
        self.assertEqual(
            log.quantity_moved,
            25,
            'Log should capture quantity moved'
        )

    def test_stock_move_log_move_type_selections(self):
        """Test that stock move log move_type has correct selections."""
        move_type_field = self.log_model._fields['move_type']
        expected_selections = ['in', 'out', 'internal', 'return', 'adjustment']
        actual_selections = [s[0] for s in move_type_field.selection]
        for expected in expected_selections:
            self.assertIn(
                expected,
                actual_selections,
                f'{expected} should be in move_type selections'
            )

    def test_access_control_stock_move_log_user(self):
        """Test that users can read stock move logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(
            logs,
            'Users should be able to read stock move logs'
        )

    def test_stock_move_log_captures_source_location(self):
        """Test that log captures source location."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        log = self.log_model.search([('record_id', '=', move.id)], limit=1)
        self.assertIsNotNone(
            log.source_location,
            'Log should capture source location'
        )

    def test_stock_move_log_captures_destination_location(self):
        """Test that log captures destination location."""
        move = self.move_model.create({
            'name': 'Test Move',
            'product_id': self.product.id,
            'product_uom_qty': 10,
            'location_id': self.location_src.id,
            'location_dest_id': self.location_dst.id,
        })
        log = self.log_model.search([('record_id', '=', move.id)], limit=1)
        self.assertIsNotNone(
            log.destination_location,
            'Log should capture destination location'
        )

    def test_stock_move_log_model_name(self):
        """Test that stock move log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.stock.move.log',
            'Stock move log model name incorrect'
        )
