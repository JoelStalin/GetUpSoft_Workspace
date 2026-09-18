import { Injectable } from '@nestjs/common';
import { BudgetStoreAdapter } from '../infrastructure/budget-store.adapter';
import { usdToMicroUsd } from '../domain/budget-period.entity';

@Injectable()
export class ReserveBudgetUseCase {
  constructor(private readonly store: BudgetStoreAdapter) {}

  async execute(organizationId: string, limitUsd: number, amountUsd: number) {
    return this.store.reserve(organizationId, limitUsd, usdToMicroUsd(amountUsd));
  }

  snapshot(organizationId: string) {
    return this.store.snapshot(organizationId);
  }
}
