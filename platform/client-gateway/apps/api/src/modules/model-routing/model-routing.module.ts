import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModelRoutingController } from './presentation/model-routing.controller';
import { RouteCapabilityUseCase } from './application/route-capability.use-case';
import { CapabilityRegistryAdapter } from './infrastructure/capability-registry.adapter';

@Module({
  imports: [ConfigModule],
  controllers: [ModelRoutingController],
  providers: [RouteCapabilityUseCase, CapabilityRegistryAdapter],
  exports: [RouteCapabilityUseCase],
})
export class ModelRoutingModule {}
