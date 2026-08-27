const DEFAULT_CAPABILITIES = Object.freeze({
  searchOpportunities: true,
  getOpportunity: true,
  prepareApplication: true,
  submitApplication: false,
});

export function indeedStatus() {
  return {
    provider: 'indeed',
    mode: 'prepare-only',
    capabilities: DEFAULT_CAPABILITIES,
    authentication: 'user-login-required-for-live-browser',
    reason: 'Discovery and application preparation are enabled; submit requires an opportunity-specific approval gate.',
  };
}

export function prepareIndeedApplication(opportunity, approval = null) {
  if (!opportunity?.opportunity_id || !opportunity?.canonical_url) {
    const error = new Error('Indeed opportunity contract is incomplete');
    error.code = 'INCOMPLETE_OPPORTUNITY';
    throw error;
  }
  return {
    ok: true,
    mode: 'prepare-only',
    opportunity_id: opportunity.opportunity_id,
    canonical_url: opportunity.canonical_url,
    approval_required: true,
    approval_id: approval?.approval_id || null,
    approval_valid: approval?.opportunity_id === opportunity.opportunity_id && approval?.status === 'approved',
    submit_performed: false,
    next_action: 'human_review_live_browser',
  };
}
