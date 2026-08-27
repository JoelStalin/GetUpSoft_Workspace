import { assertLinkedInCapability, linkedinStatus } from '../apps/orca/src/careerai/linkedin-provider.mjs';

const status = linkedinStatus();
if (status.mode !== 'discovery-only' || status.capabilities.searchPeople !== true || status.capabilities.prepareApplication !== false) {
  throw new Error('LinkedIn capability status contract failed');
}
assertLinkedInCapability('searchPeople');
let blocked = false;
try { assertLinkedInCapability('prepareApplication'); } catch (error) { blocked = error.code === 'LINKEDIN_CAPABILITY_UNAVAILABLE' && error.status === 'needs_permission'; }
if (!blocked) throw new Error('LinkedIn application gate did not block unsupported capability');
console.log(JSON.stringify({ ok: true, mode: status.mode, people_search: 'allowed', application: 'blocked' }));
