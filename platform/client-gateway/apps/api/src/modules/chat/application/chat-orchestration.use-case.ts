// U01 — orquestacion real del chat: mensaje -> normalizacion -> enrutamiento ->
// presupuesto -> interpretacion -> resultado CON evidencia visible. Integra piezas ya
// construidas y verificadas por separado (A02, K03, M01, M02) sin reimplementar su
// logica -- este caso de uso solo las orquesta en el orden correcto.
//
// Regla explicita del diseno (seccion 3.7): "una respuesta del modelo es una propuesta
// de contenido o accion. No constituye autorizacion." -- por eso el resultado siempre
// vuelve marcado approvalRequired:true, nunca se ejecuta ningun efecto desde aqui.
import { Injectable } from '@nestjs/common';
import { InterpretPromptUseCase } from '../../orca/application/use-cases/interpret-prompt.use-case';
import { RouteCapabilityUseCase } from '../../model-routing/application/route-capability.use-case';
import { ReserveBudgetUseCase } from '../../model-routing/application/reserve-budget.use-case';
import { normalizePrompt, verifyPreservation } from '../../knowledge/domain/prompt-normalizer';

export interface ChatRequest {
  organizationId: string;
  sourceType: 'text' | 'script' | 'audio';
  content: string;
}

export type ChatOutcome =
  | { status: 'blocked_normalization_failed'; missingSpans: string[] }
  | { status: 'blocked_no_capability'; reason: string }
  | { status: 'blocked_budget_exceeded'; reason: string }
  | {
      status: 'completed';
      approvalRequired: true;
      result: unknown;
      evidence: {
        normalization: { transformationsApplied: string[]; protectedSpansPreserved: number };
        routing: { tier: string; providerId: string };
        budgetReserved: boolean;
      };
    };

@Injectable()
export class ChatOrchestrationUseCase {
  constructor(
    private readonly interpretPrompt: InterpretPromptUseCase,
    private readonly routeCapability: RouteCapabilityUseCase,
    private readonly reserveBudget: ReserveBudgetUseCase,
  ) {}

  async execute(request: ChatRequest): Promise<ChatOutcome> {
    // 1. Normalizar, preservando cifras/codigo/rutas/negaciones (K03). Si algo protegido
    // se perdiera en el proceso, esto se detiene ANTES de gastar ningun presupuesto o
    // llamar a ningun modelo -- nunca se interpreta un prompt corrompido.
    const normalized = normalizePrompt(request.content);
    const preservation = verifyPreservation(normalized);
    if (!preservation.ok) {
      return { status: 'blocked_normalization_failed', missingSpans: preservation.missing.map((s) => s.text) };
    }

    // 2. Enrutar la capacidad (M01): reglas -> local -> externo gratuito -> pendiente.
    const routing = this.routeCapability.execute('interpret_prompt');
    if (routing.status === 'pending') {
      return { status: 'blocked_no_capability', reason: routing.reason };
    }

    // 3. Presupuesto (M02): solo se reserva si el tier es de pago -- local/reglas/externo
    // gratuito no consumen presupuesto monetario.
    let budgetReserved = false;
    if (routing.tier === 'external_paid') {
      // Perfil default de la organizacion (seccion 4.7: US$0/10/25) -- este caso de uso
      // no gestiona configuracion de organizacion todavia (fuera de alcance de U01), usa
      // el perfil "estandar" de US$10 como default explicito, nunca US$0 en silencio
      // (eso bloquearia CUALQUIER llamada de pago sin que fuera una decision real).
      const DEFAULT_ORG_BUDGET_USD = 10;
      const ESTIMATED_CALL_COST_USD = 0.01;
      const reservation = await this.reserveBudget.execute(request.organizationId, DEFAULT_ORG_BUDGET_USD, ESTIMATED_CALL_COST_USD);
      if (!reservation.ok) {
        return { status: 'blocked_budget_exceeded', reason: reservation.reason };
      }
      budgetReserved = true;
    }

    // 4. Interpretar (A02) -- usa el texto NORMALIZADO, nunca el original crudo.
    const result = await this.interpretPrompt.execute({ source_type: request.sourceType, content: normalized.normalizedText });

    // 5. El resultado es una PROPUESTA, nunca una autorizacion (regla 3.7) -- toda la
    // evidencia de como se llego a el queda visible junto con el resultado.
    return {
      status: 'completed',
      approvalRequired: true,
      result,
      evidence: {
        normalization: { transformationsApplied: normalized.transformationsApplied, protectedSpansPreserved: normalized.protectedSpans.length },
        routing: { tier: routing.tier, providerId: routing.providerId },
        budgetReserved,
      },
    };
  }
}
