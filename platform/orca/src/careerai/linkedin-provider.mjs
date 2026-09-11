const CAPABILITIES = Object.freeze({
  searchOpportunities: false,
  getOpportunity: false,
  prepareApplication: false,
  submitApplication: false,
  searchPeople: true,
});

export function linkedinStatus() {
  return {
    provider: 'linkedin',
    mode: 'discovery-only',
    capabilities: CAPABILITIES,
    authentication: 'user-consent-required',
    reason: 'Current official connector exposes people search only; Jobs/Apply is not enabled.',
  };
}

export function assertLinkedInCapability(action) {
  if (CAPABILITIES[action] !== true) {
    const error = new Error(`LinkedIn capability unavailable: ${action}`);
    error.code = 'LINKEDIN_CAPABILITY_UNAVAILABLE';
    error.status = 'needs_permission';
    throw error;
  }
  return { ok: true, action, mode: 'discovery-only' };
}
