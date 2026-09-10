// B03 - Supervision de Procesos y Adaptadores de Runtime
import fs from 'node:fs';
import path from 'node:path';

export class ProcessSupervisor {
  constructor({ stateFilePath = null } = {}) {
    this.stateFilePath = stateFilePath;
    this.activeProcesses = new Map();
  }

  isPidAlive(pid) {
    if (!pid || typeof pid !== 'number') return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch (err) {
      return false;
    }
  }

  registerProcess({ runId, service, pid, command }) {
    if (this.activeProcesses.has(service)) {
      const existing = this.activeProcesses.get(service);
      if (this.isPidAlive(existing.pid)) {
        const error = new Error(`El servicio '${service}' ya se encuentra en ejecucion con PID` + existing.pid);
        error.code = 'ERR_DUPLICATE_START';
        error.service = service;
        error.existingPid = existing.pid;
        throw error;
      }
    }

    const record = {
      runId,
      service,
      pid,
      command,
      startedAt: new Date().toISOString(),
      status: 'RUNNING'
    };

    this.activeProcesses.set(service, record);
    this._persistState();
    return record;
  }

  stopProcess(service, { signal = 'SIGTERM' } = {}) {
    if (!this.activeProcesses.has(service)) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    const record = this.activeProcesses.get(service);
    if (this.isPidAlive(record.pid)) {
      try {
        process.kill(record.pid, signal);
      } catch (err) {
      }
    }

    record.status = 'STOPPED';
    record.stoppedAt = new Date().toISOString();
    this.activeProcesses.delete(service);
    this._persistState();

    return { ok: true, service, stoppedPid: record.pid };
  }

  rollbackAll(reason = 'PARTIAL_FAILURE') {
    const rolledBack = [];
    for (const [service, record] of Array.from(this.activeProcesses.entries())) {
      if (this.isPidAlive(record.pid)) {
        try {
          process.kill(record.pid, 'SIGTERM');
        } catch (e) {
        }
      }
      record.status = 'ROLLED_BACK';
      record.rollbackReason = reason;
      rolledBack.push(service);
      this.activeProcesses.delete(service);
    }
    this._persistState();
    return {
      ok: true,
      rolledBackCount: rolledBack.length,
      rolledBackServices: rolledBack,
      reason
    };
  }

  getStatus() {
    const list = [];
    for (const [service, record] of this.activeProcesses.entries()) {
      list.push({
        ...record,
        alive: this.isPidAlive(record.pid)
      });
    }
    return list;
  }

  _persistState() {
    if (!this.stateFilePath) return;
    try {
      const data = Object.fromEntries(this.activeProcesses);
      fs.mkdirSync(path.dirname(this.stateFilePath), { recursive: true });
      fs.writeFileSync(this.stateFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
    }
  }
}
