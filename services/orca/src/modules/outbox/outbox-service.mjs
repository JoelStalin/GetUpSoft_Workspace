// E01 - Durable Outbox & Message Relay
export class OutboxService {
  constructor() {
    this.messages = [];
  }
  publish({ topic, payload, idempotencyKey }) {
    if (this.messages.some(m => m.idempotencyKey === idempotencyKey)) {
      return { ok: true, deduplicated: true, idempotencyKey };
    }
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      topic,
      payload,
      idempotencyKey,
      status: 'QUEUED',
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);
    return { ok: true, deduplicated: false, messageId: msg.id };
  }
  processBatch() {
    const pending = this.messages.filter(m => m.status === 'QUEUED');
    for (const m of pending) {
      m.status = 'DELIVERED';
      m.deliveredAt = new Date().toISOString();
    }
    return { processedCount: pending.length };
  }
}
