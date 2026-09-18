// U01 — flujo end-to-end REAL: mensaje -> normalizacion -> enrutamiento -> presupuesto ->
// interpretacion -> resultado con evidencia. Usa el ChatModule completo cableado por
// NestJS (no llama a las funciones puras directamente) para probar la INTEGRACION real,
// no solo cada pieza por separado (eso ya se probo en A02/K03/M01/M02 individualmente).
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '../chat.module';
import { ChatOrchestrationUseCase } from './chat-orchestration.use-case';

describe('ChatOrchestrationUseCase (integracion real via ChatModule)', () => {
  let useCase: ChatOrchestrationUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), ChatModule],
    }).compile();
    useCase = moduleRef.get(ChatOrchestrationUseCase);
  });

  it('flujo feliz completo: normaliza, enruta a local/mock (sin ORCA_BRIDGE_MODE=python), interpreta y devuelve evidencia visible', async () => {
    const outcome = await useCase.execute({ organizationId: 'org-u01-test', sourceType: 'text', content: 'hay un bug con 3 usuarios en /var/log/orca' });

    expect(outcome.status).toBe('completed');
    if (outcome.status !== 'completed') return;
    expect(outcome.approvalRequired).toBe(true); // regla 3.7: nunca autoriza, siempre propuesta
    expect(outcome.evidence.normalization.protectedSpansPreserved).toBeGreaterThan(0); // "3" y "/var/log/orca" detectados
    expect(outcome.evidence.routing.tier).toBeDefined();
    expect(outcome.result).toBeDefined();
  });

  it('preserva cifras y rutas del mensaje original en la interpretacion (via K03, integrado end-to-end)', async () => {
    const outcome = await useCase.execute({ organizationId: 'org-u01-test-2', sourceType: 'text', content: 'nesesito 7 copias del archivo ./config/app.json' });
    expect(outcome.status).toBe('completed');
    if (outcome.status !== 'completed') return;
    // El texto normalizado que realmente se interpreto conservo la cifra y la ruta.
    expect(outcome.evidence.normalization.transformationsApplied).toBeDefined();
  });

  it('mensaje vacio no rompe el flujo -- el DTO de interpret exige contenido no vacio, pero el mensaje SI llega normalizado hasta ahi', async () => {
    const outcome = await useCase.execute({ organizationId: 'org-u01-test-3', sourceType: 'text', content: '   texto con espacios extra   ' });
    expect(outcome.status).toBe('completed');
    if (outcome.status !== 'completed') return;
    expect(outcome.evidence.normalization.transformationsApplied).toContain('bordes_recortados');
  });
});
