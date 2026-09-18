import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestWebsitePageOrcaLogging(TransactionCase):
    """Test suite for website page ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.page_model = self.env['website.page']
        self.log_model = self.env['orca.website.page.log']
        self.website = self.env['website'].browse(1)

    def test_website_page_inherits_orca_mixin(self):
        """Test that website.page inherits orca.universal.mixin."""
        self.assertTrue(
            self.page_model._inherits.get('orca.universal.mixin'),
            'website.page should inherit orca.universal.mixin'
        )

    def test_website_page_orca_tier_medium(self):
        """Test that website.page has MEDIUM tier classification."""
        self.assertEqual(
            self.page_model._orca_tier,
            'medium',
            'website.page should have MEDIUM tier'
        )

    def test_website_page_log_model_configured(self):
        """Test that website page log model is properly configured."""
        self.assertEqual(
            self.page_model._orca_log_model,
            'orca.website.page.log',
            'Website page should use orca.website.page.log'
        )

    def test_website_page_log_model_has_required_fields(self):
        """Test that website page log has all required fields."""
        required_fields = ['page_url', 'page_title', 'is_published', 'website_id', 'author_id', 'page_type']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Website page log should have {field} field'
            )

    def test_website_page_log_inherits_from_orca_log(self):
        """Test that website page log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Website page log should inherit from orca.log'
        )

    def test_website_page_create_action_logged(self):
        """Test that creating a website page generates an ORCA log entry."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        logs = self.log_model.search([('record_id', '=', page.id)])
        self.assertTrue(len(logs) > 0, 'Website page creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_website_page_write_action_logged(self):
        """Test that modifying a website page generates an ORCA log entry."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        page.write({'is_published': True})
        logs = self.log_model.search([('record_id', '=', page.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Website page modification should generate a log entry')

    def test_website_page_unlink_action_logged(self):
        """Test that deleting a website page generates an ORCA log entry."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        page_id = page.id
        page.unlink()
        logs = self.log_model.search([('record_id', '=', page_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Website page deletion should generate a log entry')

    def test_website_page_log_captures_tracked_fields(self):
        """Test that website page log captures tracked field values."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        page.write({'name': 'Updated Page'})
        logs = self.log_model.search([('record_id', '=', page.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('name', after_values, 'Tracked fields should be in after_values')

    def test_website_page_log_user_tracking(self):
        """Test that website page log tracks which user made the change."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        logs = self.log_model.search([('record_id', '=', page.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_website_page_log_date_tracking(self):
        """Test that website page log captures timestamp."""
        page = self.page_model.create({
            'name': 'Test Page',
            'url': '/test-page',
            'type': 'custom',
            'website_id': self.website.id,
        })
        logs = self.log_model.search([('record_id', '=', page.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_website_page_log_user(self):
        """Test that regular users can read website page logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read website page logs')

    def test_website_page_log_model_name(self):
        """Test that website page log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.website.page.log',
            'Website page log model name incorrect'
        )

    def test_page_type_field_selections(self):
        """Test that page_type field has correct selections."""
        type_field = self.log_model._fields['page_type']
        expected_selections = ['custom', 'ecommerce', 'blog', 'form']
        actual_selections = [s[0] for s in type_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in page_type selections')
