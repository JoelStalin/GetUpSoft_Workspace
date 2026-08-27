import fs from 'node:fs';

const file = new URL('../data/careerai/application-assets.json', import.meta.url);
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
const source = doc.source_documents?.find((asset) => asset.kind === 'original_cv');
if (!source?.immutable_source || source.content_copied_to_repo !== false || !source.sha256) throw new Error('Original CV preservation contract failed');
for (const kind of ['cv_customized', 'cover_letter', 'answers']) {
  if (doc.derived_assets?.[kind]?.per_opportunity !== true) throw new Error(`${kind} must be per-opportunity`);
}
if (doc.derived_assets.cover_letter.status !== 'email_draft_only' || doc.external_application_policy.email_mode !== 'approved_send_after_explicit_approval') throw new Error('Approved email send contract failed');
if (doc.external_application_policy.email_send_policy?.recipient_allowlist_required !== true || doc.external_application_policy.whatsapp_notification?.mode !== 'sent_summary_only') throw new Error('Email/WhatsApp notification policy failed');
for (const gate of ['captcha', 'mfa', 'unknown_domain', 'submit']) if (!doc.external_application_policy.pause_on.includes(gate)) throw new Error(`Missing pause gate: ${gate}`);
console.log(JSON.stringify({ ok: true, schema_version: doc.schema_version, original_cv_preserved: true, derived_assets: 3 }));
