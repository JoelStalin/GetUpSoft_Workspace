import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModelRoutingController } from './presentation/model-routing.controller';
import { RouteCapabilityUseCase } from './application/route-capability.use-case';
import { ReserveBudgetUseCase } from './application/reserve-budget.use-case';
import { CapabilityRegistryAdapter } from './infrastructure/capability-registry.adapter';
import { BudgetStoreAdapter } from './infrastructure/budget-store.adapter';

@Module({
  imports: [ConfigModule],
  controllers: [ModelRoutingController],
  providers: [RouteCapabilityUseCase, CapabilityRegistryAdapter, ReserveBudgetUseCase, BudgetStoreAdapter],
  exports: [RouteCapabilityUseCase, ReserveBudgetUseCase],
})
export class ModelRoutingModule {}
