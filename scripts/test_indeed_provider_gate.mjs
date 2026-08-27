import { indeedStatus, prepareIndeedApplication } from '../apps/orca/src/careerai/indeed-provider.mjs';

const status = indeedStatus();
if (status.mode !== 'prepare-only' || status.capabilities.submitApplication !== false) throw new Error('Indeed status gate failed');
const opportunity = { opportunity_id: 'indeed-fixture-001', canonical_url: 'https://example.invalid/jobs/001' };
const draft = prepareIndeedApplication(opportunity);
if (draft.submit_performed !== false || draft.approval_required !== true || draft.approval_valid !== false) throw new Error('Indeed prepare-only guard failed');
const approved = prepareIndeedApplication(opportunity, { approval_id: 'approval-001', opportunity_id: opportunity.opportunity_id, status: 'approved' });
if (approved.approval_valid !== true || approved.submit_performed !== false) throw new Error('Indeed opportunity-specific approval contract failed');
console.log(JSON.stringify({ ok: true, mode: status.mode, draft: 'safe', submit: 'disabled' }));
