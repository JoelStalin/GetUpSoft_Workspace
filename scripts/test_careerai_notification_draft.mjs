import { execFileSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'node.exe' : 'node';
const args = ['scripts/run_careerai_notification_draft.mjs', 'whatsapp', 'approval-001', 'allowlisted-owner'];
const first = JSON.parse(execFileSync(command, args, { encoding: 'utf8' }));
const second = JSON.parse(execFileSync(command, args, { encoding: 'utf8' }));
if (first.mode !== 'draft-only' || first.send_performed !== false || first.approval_required !== true) throw new Error('Notification draft guard failed');
if (first.idempotency_key !== second.idempotency_key) throw new Error('Notification idempotency key is unstable');
console.log(JSON.stringify({ ok: true, channel: first.channel, delivery_status: first.delivery_status, idempotency: 'stable' }));
