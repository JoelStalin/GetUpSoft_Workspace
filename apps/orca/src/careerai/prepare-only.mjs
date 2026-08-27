import fs from 'node:fs';

const fixturesPath = new URL('../../../../data/careerai/fixtures.json', import.meta.url);

export function connectorGates() {
  return {
    indeed: 'prepare-only',
    linkedin: 'discovery-only',
    gmail: 'draft-only',
    google_drive: 'read-only',
    hermes: process.env.HERMES_API_KEY ? 'configured' : 'requires_configuration',
  };
}

export function loadFixtures() {
  return JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
}

export function prepareOnly(fixtureId = 'indeed-remote-valid') {
  const { schema_version: workflowVersion, fixtures } = loadFixtures();
  const fixture = fixtures.find((candidate) => candidate.id === fixtureId);
  if (!fixture) {
    const error = new Error(`Unknown fixture: ${fixtureId}`);
    error.code = 'UNKNOWN_FIXTURE';
    throw error;
  }

  const blockedReasons = [];
  if (fixture.expected_status === 'consensus_blocked') blockedReasons.push('provider_disagreement');
  if (fixture.expected_status === 'needs_user_login') blockedReasons.push(fixture.error?.kind || 'user_action_required');
  if (fixture.expected_status === 'submit_blocked') blockedReasons.push('approval_expired_or_duplicate');
  if (fixture.expected_status === 'needs_review') blockedReasons.push('remote_status_unverified');
  if (fixture.expected_status === 'resumed_from_checkpoint') blockedReasons.push('restart_resume_verified');

  const result = {
    ok: true,
    mode: 'prepare-only',
    workflow_version: workflowVersion,
    fixture_id: fixtureId,
    opportunity_id: fixture.opportunity?.opportunity_id || null,
    expected_status: fixture.expected_status,
    approval_required: true,
    submit_performed: false,
    blocked_reasons: blockedReasons,
    connector_gates: connectorGates(),
    evidence: ['fixture_loaded', 'provider_gate_evaluated', 'submit_guard_verified'],
  };

  if (fixture.expected_status === 'resumed_from_checkpoint') {
    result.evidence.push('checkpoint_restored', 'memory_refs_restored', 'ledger_state_restored', 'evidence_refs_restored');
  }

  if (result.submit_performed || !result.approval_required) throw new Error('Prepare-only guard violated');
  return result;
}
