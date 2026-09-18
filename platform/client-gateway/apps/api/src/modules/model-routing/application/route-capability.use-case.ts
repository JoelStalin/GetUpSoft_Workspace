import { Injectable } from '@nestjs/common';
import { decideRoute } from '../domain/routing-policy';
import { RoutingDecision } from '../domain/capability-provider.entity';
import { CapabilityRegistryAdapter } from '../infrastructure/capability-registry.adapter';

@Injectable()
export class RouteCapabilityUseCase {
  constructor(private readonly registry: CapabilityRegistryAdapter) {}

  execute(capability: string, options: { allowPaidForMilestoneReview?: boolean } = {}): RoutingDecision {
    return decideRoute(capability, this.registry.list(), options);
  }

  listCapabilities() {
    const providers = this.registry.list();
    const byCapability = new Map<string, typeof providers>();
    for (const provider of providers) {
      const list = byCapability.get(provider.capability) ?? [];
      list.push(provider);
      byCapability.set(provider.capability, list);
    }
    return Object.fromEntries(byCapability);
  }
}
