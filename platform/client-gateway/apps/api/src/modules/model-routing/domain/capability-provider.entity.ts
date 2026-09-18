// M01 — dominio: sin imports de NestJS/Prisma/Docker/SDK de modelos.
export type ProviderTier = 'rule' | 'local' | 'external_free' | 'external_paid';

export interface CapabilityProvider {
  tier: ProviderTier;
  providerId: string;
  capability: string;
  available: boolean;
  // Motivo honesto de por que available es false (config faltante, cuota agotada, etc.)
  // -- nunca se asume disponible sin una razon explicita para lo contrario.
  unavailableReason?: string;
}

export type RoutingDecision =
  | { status: 'routed'; capability: string; tier: ProviderTier; providerId: string; reason: string }
  | { status: 'pending'; capability: string; reason: string };
