// M02 — infraestructura: store en memoria con serializacion real por organizacion. La
// sobreasignacion bajo concurrencia ocurre cuando dos llamadas leen el mismo estado
// "viejo" antes de que la primera escriba su reserva. Aqui se evita con una cola de
// promesas por organizacion: cada reserva espera a que termine la anterior de la MISMA
// organizacion antes de leer el estado -- organizaciones distintas SI corren en paralelo
// (regla explicita del diseno: "distintos tenants en paralelo").
import { Injectable } from '@nestjs/common';
import { BudgetPeriod, createBudgetPeriod, reserveBudget, commitSpend, releaseReservation, ReservationResult } from '../domain/budget-period.entity';

@Injectable()
export class BudgetStoreAdapter {
  private readonly periods = new Map<string, BudgetPeriod>();
  private readonly queues = new Map<string, Promise<unknown>>();

  private getOrCreate(organizationId: string, limitUsd: number): BudgetPeriod {
    let period = this.periods.get(organizationId);
    if (!period) {
      period = createBudgetPeriod(organizationId, limitUsd);
      this.periods.set(organizationId, period);
    }
    return period;
  }

  // Encadena la operacion detras de la ultima pendiente de la MISMA organizacion. Nunca
  // hay un `await` entre leer el estado y decidir la reserva dentro de esta seccion.
  private async runSerialized<T>(organizationId: string, fn: () => T): Promise<T> {
    const previous = this.queues.get(organizationId) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    this.queues.set(organizationId, previous.then(() => gate));
    await previous;
    try {
      return fn();
    } finally {
      release();
    }
  }

  async reserve(organizationId: string, limitUsd: number, amountMicroUsd: bigint): Promise<ReservationResult> {
    return this.runSerialized(organizationId, () => {
      const current = this.getOrCreate(organizationId, limitUsd);
      const result = reserveBudget(current, amountMicroUsd);
      if (result.ok) this.periods.set(organizationId, result.period);
      return result;
    });
  }

  async commit(organizationId: string, amountMicroUsd: bigint): Promise<BudgetPeriod> {
    return this.runSerialized(organizationId, () => {
      const current = this.periods.get(organizationId);
      if (!current) throw new Error(`sin periodo de presupuesto para organizacion ${organizationId}`);
      const next = commitSpend(current, amountMicroUsd);
      this.periods.set(organizationId, next);
      return next;
    });
  }

  async release(organizationId: string, amountMicroUsd: bigint): Promise<BudgetPeriod> {
    return this.runSerialized(organizationId, () => {
      const current = this.periods.get(organizationId);
      if (!current) throw new Error(`sin periodo de presupuesto para organizacion ${organizationId}`);
      const next = releaseReservation(current, amountMicroUsd);
      this.periods.set(organizationId, next);
      return next;
    });
  }

  snapshot(organizationId: string): BudgetPeriod | null {
    return this.periods.get(organizationId) ?? null;
  }
}
