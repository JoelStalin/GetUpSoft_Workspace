// M01 — politica de enrutamiento (funcion pura, sin efectos secundarios ni IO). Orden
// estricto de la seccion 3.8 del diseno GetUpSoft+ORCA:
//   reglas/scripts -> modelo local -> proveedor externo gratuito -> pendiente/reintento.
// Los modelos de pago NUNCA se seleccionan automaticamente aqui -- tienen una ruta
// separada, reservada a supervision de hitos, que exige allowPaidForMilestoneReview:true
// explicito del llamador (nunca inferido).
import { CapabilityProvider, ProviderTier, RoutingDecision } from './capability-provider.entity';

const AUTOMATIC_TIER_ORDER: ProviderTier[] = ['rule', 'local', 'external_free'];

export function decideRoute(
  capability: string,
  providers: CapabilityProvider[],
  { allowPaidForMilestoneReview = false }: { allowPaidForMilestoneReview?: boolean } = {},
): RoutingDecision {
  const forCapability = providers.filter((p) => p.capability === capability);

  for (const tier of AUTOMATIC_TIER_ORDER) {
    const candidate = forCapability.find((p) => p.tier === tier && p.available);
    if (candidate) {
      return { status: 'routed', capability, tier, providerId: candidate.providerId, reason: `primer proveedor disponible en el tier "${tier}"` };
    }
  }

  if (allowPaidForMilestoneReview) {
    const paid = forCapability.find((p) => p.tier === 'external_paid' && p.available);
    if (paid) {
      return { status: 'routed', capability, tier: 'external_paid', providerId: paid.providerId, reason: 'sin capacidad gratuita disponible; autorizado explicitamente para revision de hito' };
    }
  }

  const knownButUnavailable = forCapability.filter((p) => p.tier !== 'external_paid' || allowPaidForMilestoneReview);
  const reason = knownButUnavailable.length
    ? `ninguna capacidad ${allowPaidForMilestoneReview ? '(incluyendo pago)' : 'gratuita'} disponible para "${capability}": ${knownButUnavailable.map((p) => `${p.providerId}(${p.unavailableReason ?? 'no disponible'})`).join(', ')}`
    : `capacidad "${capability}" no declarada en ningun proveedor del catalogo`;

  return { status: 'pending', capability, reason };
}
