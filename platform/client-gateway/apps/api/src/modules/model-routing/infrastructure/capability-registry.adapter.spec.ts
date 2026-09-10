// Bug real encontrado durante U01: sin ninguna API key configurada, el catalogo
// declaraba TODOS los proveedores de interpret_prompt como no disponibles -> el router
// (M01) devolvia "pending" -> el chat quedaba bloqueado por completo, aunque el modulo
// orca (A02) SIEMPRE tiene un fallback mock funcional. Este test fija que eso no vuelva
// a pasar.
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CapabilityRegistryAdapter } from './capability-registry.adapter';
import { decideRoute } from '../domain/routing-policy';

describe('CapabilityRegistryAdapter (regresion del bug de U01)', () => {
  it('sin NINGUNA variable de entorno de proveedor configurada, interpret_prompt sigue siendo enrutable (tier rule)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [CapabilityRegistryAdapter],
    }).compile();
    const registry = moduleRef.get(CapabilityRegistryAdapter);
    const config = moduleRef.get(ConfigService);

    // Confirma el escenario real que causo el bug: cero configuracion.
    expect(config.get('OLLAMA_BASE_URL')).toBeUndefined();
    expect(config.get('NVIDIA_API_KEY')).toBeUndefined();

    const providers = registry.list();
    const decision = decideRoute('interpret_prompt', providers);
    expect(decision.status).toBe('routed');
    if (decision.status === 'routed') {
      expect(decision.tier).toBe('rule');
      expect(decision.providerId).toBe('orca-mock-fallback');
    }
  });
});
