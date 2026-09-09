import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkSessionAlive } from './scraping-session-guard.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const vaultDir = path.join(root, 'data', 'careerai', 'browser-sessions');
const SAFE_ID = /^[a-z0-9][a-z0-9_-]{1,63}$/i;

function assertId(value, field) {
  if (!SAFE_ID.test(value || '')) throw Object.assign(new Error(`invalid_${field}`), { code: `INVALID_${field.toUpperCase()}` });
}
function sessionPath(tenantId, portal) {
  assertId(tenantId, 'tenant_id'); assertId(portal, 'portal');
  return path.join(vaultDir, tenantId, `${portal}.json`);
}
function atomicWrite(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(payload, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, file);
}

export function saveBrowserSession(input = {}) {
  const { tenant_id, portal, profile_ref, captured_at, expires_at, authenticated } = input;
  assertId(tenant_id, 'tenant_id'); assertId(portal, 'portal');
  if (!profile_ref || !captured_at || !expires_at) throw Object.assign(new Error('missing_session_fields'), { code: 'MISSING_SESSION_FIELDS' });
  const record = {
    schema_version: 'careerai.browser-session.v1', tenant_id, portal, profile_ref,
    session_id: input.session_id || `session-${crypto.randomBytes(8).toString('hex')}`,
    captured_at, expires_at, authenticated: authenticated === true,
    last_used_at: input.last_used_at || captured_at,
    // Cookies, passwords and tokens deliberately remain inside the named browser profile.
    storage_policy: 'profile_reference_only',
  };
  atomicWrite(sessionPath(tenant_id, portal), record);
  return { ok: true, persisted: true, secret_material_persisted: false, session: record };
}

export function getReusableBrowserSession({ tenant_id, portal, now = new Date() } = {}) {
  const file = sessionPath(tenant_id, portal);
  if (!fs.existsSync(file)) return { ok: true, reusable: false, status: 'missing', session: null };
  const session = JSON.parse(fs.readFileSync(file, 'utf8'));
  const health = checkSessionAlive(session, { tenant_id, portal, now });
  return { ok: true, reusable: health.alive === true && session.authenticated === true, status: health.status, reason: health.reason, session };
}

export function touchBrowserSession({ tenant_id, portal, now = new Date() } = {}) {
  const reusable = getReusableBrowserSession({ tenant_id, portal, now });
  if (!reusable.reusable) return reusable;
  const session = { ...reusable.session, last_used_at: now.toISOString() };
  atomicWrite(sessionPath(tenant_id, portal), session);
  return { ...reusable, session };
}

export function revokeBrowserSession({ tenant_id, portal } = {}) {
  const file = sessionPath(tenant_id, portal);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  return { ok: true, revoked: true, tenant_id, portal };
}
