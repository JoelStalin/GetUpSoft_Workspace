import assert from 'node:assert/strict';
import { saveBrowserSession, getReusableBrowserSession, revokeBrowserSession } from '../apps/orca/src/careerai/browser-session-vault.mjs';

const now = new Date('2026-08-28T15:00:00Z');
const saved = saveBrowserSession({
  tenant_id: 'test-session-vault', portal: 'indeed', profile_ref: 'chrome-profile-test',
  captured_at: now.toISOString(), expires_at: '2026-08-28T16:00:00Z', authenticated: true,
});
assert.equal(saved.persisted, true);
assert.equal(saved.secret_material_persisted, false);

const reusable = getReusableBrowserSession({ tenant_id: 'test-session-vault', portal: 'indeed', now: new Date('2026-08-28T15:30:00Z') });
assert.equal(reusable.reusable, true);
assert.equal(reusable.session.profile_ref, 'chrome-profile-test');

const expired = getReusableBrowserSession({ tenant_id: 'test-session-vault', portal: 'indeed', now: new Date('2026-08-28T16:00:01Z') });
assert.equal(expired.reusable, false);
assert.equal(expired.status, 'expired');

const revoked = revokeBrowserSession({ tenant_id: 'test-session-vault', portal: 'indeed' });
assert.equal(revoked.revoked, true);
console.log(JSON.stringify({ ok: true, node: 'browser-session-vault', reuse: true, expiry: true, secrets: false }));
