import json
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestApplicantOrcaLogging(TransactionCase):
    """Test suite for applicant ORCA audit logging."""

    def setUp(self):
        super().setUp()
        self.env = self.env(user=self.env.ref('base.user_admin'))
        self.applicant_model = self.env['hr.applicant']
        self.log_model = self.env['orca.applicant.log']

    def test_hr_applicant_inherits_orca_mixin(self):
        """Test that hr.applicant inherits orca.universal.mixin."""
        self.assertTrue(
            self.applicant_model._inherits.get('orca.universal.mixin'),
            'hr.applicant should inherit orca.universal.mixin'
        )

    def test_applicant_orca_tier_high(self):
        """Test that hr.applicant has HIGH tier classification."""
        self.assertEqual(
            self.applicant_model._orca_tier,
            'high',
            'hr.applicant should have HIGH tier'
        )

    def test_applicant_log_model_configured(self):
        """Test that applicant log model is properly configured."""
        self.assertEqual(
            self.applicant_model._orca_log_model,
            'orca.applicant.log',
            'Applicant should use orca.applicant.log'
        )

    def test_applicant_log_model_has_required_fields(self):
        """Test that applicant log has all required fields."""
        required_fields = ['applicant_name', 'applicant_email', 'job_position', 'department_name', 'stage_name', 'phone', 'source', 'rating']
        for field in required_fields:
            self.assertTrue(
                field in self.log_model._fields,
                f'Applicant log should have {field} field'
            )

    def test_applicant_log_inherits_from_orca_log(self):
        """Test that applicant log inherits from orca.log."""
        self.assertIn(
            'orca.log',
            self.log_model._inherit if isinstance(self.log_model._inherit, list) else [self.log_model._inherit],
            'Applicant log should inherit from orca.log'
        )

    def test_applicant_create_action_logged(self):
        """Test that creating an applicant generates an ORCA log entry."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        logs = self.log_model.search([('record_id', '=', applicant.id)])
        self.assertTrue(len(logs) > 0, 'Applicant creation should generate at least one log')
        self.assertEqual(logs[0].action, 'create', 'Log action should be create')

    def test_applicant_write_action_logged(self):
        """Test that modifying an applicant generates an ORCA log entry."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        applicant.write({'active': False})
        logs = self.log_model.search([('record_id', '=', applicant.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Applicant modification should generate a log entry')

    def test_applicant_unlink_action_logged(self):
        """Test that deleting an applicant generates an ORCA log entry."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        applicant_id = applicant.id
        applicant.unlink()
        logs = self.log_model.search([('record_id', '=', applicant_id), ('action', '=', 'unlink')])
        self.assertTrue(len(logs) > 0, 'Applicant deletion should generate a log entry')

    def test_applicant_log_captures_tracked_fields(self):
        """Test that applicant log captures tracked field values."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        applicant.write({'rating': 4.5})
        logs = self.log_model.search([('record_id', '=', applicant.id), ('action', '=', 'write')])
        self.assertTrue(len(logs) > 0, 'Log should be created on write')
        after_values = json.loads(logs[0].after_values)
        self.assertIn('rating', after_values, 'Tracked fields should be in after_values')

    def test_applicant_log_user_tracking(self):
        """Test that applicant log tracks which user made the change."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        logs = self.log_model.search([('record_id', '=', applicant.id)])
        self.assertTrue(logs[0].user_id, 'Log should track user')
        self.assertEqual(logs[0].user_id, self.env.user, 'Log user should match current user')

    def test_applicant_log_date_tracking(self):
        """Test that applicant log captures timestamp."""
        job = self.env['hr.job'].search([], limit=1)
        if not job:
            job = self.env['hr.job'].create({'name': 'Test Job'})
        applicant = self.applicant_model.create({
            'name': 'Test Applicant',
            'email_from': 'test@example.com',
            'job_id': job.id,
        })
        logs = self.log_model.search([('record_id', '=', applicant.id)])
        self.assertTrue(logs[0].date, 'Log should have date timestamp')

    def test_access_control_applicant_log_user(self):
        """Test that regular users can read applicant logs."""
        user = self.env.ref('base.user_demo')
        logs = self.log_model.with_user(user).search([])
        self.assertIsNotNone(logs, 'Users should be able to read applicant logs')

    def test_access_control_applicant_log_hr_user(self):
        """Test that HR users can read applicant logs."""
        hr_user = self.env['res.users'].create({
            'name': 'Test HR User',
            'login': 'hr_recruitment_user@test.com',
            'groups_id': [(6, 0, [self.env.ref('hr.group_hr_user').id])],
        })
        logs = self.log_model.with_user(hr_user).search([])
        self.assertIsNotNone(logs, 'HR users should be able to read applicant logs')

    def test_applicant_log_model_name(self):
        """Test that applicant log model has correct name."""
        self.assertEqual(
            self.log_model._name,
            'orca.applicant.log',
            'Applicant log model name incorrect'
        )

    def test_applicant_stage_field_selections(self):
        """Test that stage_name field has correct selections."""
        stage_field = self.log_model._fields['stage_name']
        expected_selections = ['initiate', 'screen', 'interview', 'test', 'offer', 'refuse', 'hired']
        actual_selections = [s[0] for s in stage_field.selection]
        for expected in expected_selections:
            self.assertIn(expected, actual_selections, f'{expected} should be in stage_name selections')
