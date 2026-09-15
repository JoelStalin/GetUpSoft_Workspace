// M02 - Budget Reservation System
export class BudgetReservationService {
  constructor({ profiles = { free: 0, starter: 10, pro: 25 } } = {}) {
    this.profiles = profiles;
    this.tenantBalances = new Map(); // tenantId -> remainingUsd
  }
  initTenant(tenantId, profile = 'free') {
    const limit = this.profiles[profile] ?? 0;
    this.tenantBalances.set(tenantId, limit);
    return { tenantId, limit };
  }
  reserveBudget(tenantId, amountUsd) {
    const current = this.tenantBalances.get(tenantId) ?? 0;
    if (current < amountUsd) {
      const err = new Error('Presupuesto insuficiente para la operacion');
      err.code = 'ERR_BUDGET_EXCEEDED';
      err.available = current;
      err.requested = amountUsd;
      throw err;
    }
    this.tenantBalances.set(tenantId, current - amountUsd);
    return { ok: true, remaining: current - amountUsd };
  }
}
