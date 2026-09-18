// O01 - Structured Observability & Audit Logger
export class AuditLogger {
  constructor({ destination = null } = {}) {
    this.destination = destination;
    this.logs = [];
  }

  log({ level = 'info', event, actorId, organizationId, metadata = {} }) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      event,
      actorId,
      organizationId,
      metadata
    };
    this.logs.push(entry);
    return entry;
  }

  query({ organizationId = null, event = null } = {}) {
    return this.logs.filter(entry => {
      if (organizationId && entry.organizationId !== organizationId) return false;
      if (event && entry.event !== event) return false;
      return true;
    });
  }
}
