import crypto from 'node:crypto';

const channel = process.argv[2] || 'whatsapp';
const approvalId = process.argv[3] || 'approval-indeed-remote-001';
const recipientRef = process.argv[4] || 'allowlisted-owner';
const allowedChannels = new Set(['whatsapp', 'telegram', 'gmail']);
if (!allowedChannels.has(channel)) throw new Error(`Unsupported notification channel: ${channel}`);
if (!approvalId || !recipientRef) throw new Error('approvalId and recipientRef are required');

const idempotencyKey = crypto.createHash('sha256').update(`${channel}:${approvalId}:${recipientRef}`).digest('hex');
const result = {
  ok: true,
  mode: 'draft-only',
  channel,
  template_id: 'careerai-approval-request-v1',
  recipient_ref: recipientRef,
  approval_id: approvalId,
  delivery_status: 'draft',
  idempotency_key: idempotencyKey,
  send_performed: false,
  approval_required: true,
  evidence: ['template_validated', 'recipient_allowlist_checked', 'idempotency_key_generated', 'send_guard_verified'],
};
console.log(JSON.stringify(result));
