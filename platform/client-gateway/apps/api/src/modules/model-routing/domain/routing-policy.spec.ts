import { decideRoute } from './routing-policy';
import { CapabilityProvider } from './capability-provider.entity';

describe('decideRoute', () => {
  const providers: CapabilityProvider[] = [
    { tier: 'local', providerId: 'ollama', capability: 'interpret_prompt', available: true },
    { tier: 'external_free', providerId: 'nvidia', capability: 'interpret_prompt', available: true },
    { tier: 'external_paid', providerId: 'openai', capability: 'interpret_prompt', available: true },
  ];

  it('prefiere local sobre externo gratuito cuando ambos estan disponibles', () => {
    const decision = decideRoute('interpret_prompt', providers);
    expect(decision.status).toBe('routed');
    expect(decision).toMatchObject({ tier: 'local', providerId: 'ollama' });
  });

  it('cae a externo gratuito si local no esta disponible', () => {
    const sinLocal = providers.map((p) => (p.tier === 'local' ? { ...p, available: false, unavailableReason: 'no configurado' } : p));
    const decision = decideRoute('interpret_prompt', sinLocal);
    expect(decision.status).toBe('routed');
    expect(decision).toMatchObject({ tier: 'external_free', providerId: 'nvidia' });
  });

  it('NUNCA selecciona un proveedor de pago automaticamente, aunque sea el unico disponible', () => {
    const soloDePago: CapabilityProvider[] = [
      { tier: 'external_paid', providerId: 'openai', capability: 'interpret_prompt', available: true },
    ];
    const decision = decideRoute('interpret_prompt', soloDePago);
    expect(decision.status).toBe('pending');
  });

  it('con allowPaidForMilestoneReview:true SI puede usar el proveedor de pago', () => {
    const soloDePago: CapabilityProvider[] = [
      { tier: 'external_paid', providerId: 'openai', capability: 'interpret_prompt', available: true },
    ];
    const decision = decideRoute('interpret_prompt', soloDePago, { allowPaidForMilestoneReview: true });
    expect(decision.status).toBe('routed');
    expect(decision).toMatchObject({ tier: 'external_paid', providerId: 'openai' });
  });

  it('capacidad sin ningun proveedor declarado queda pendiente con razon explicita', () => {
    const decision = decideRoute('image_generation', providers);
    expect(decision.status).toBe('pending');
    if (decision.status === 'pending') {
      expect(decision.reason).toContain('no declarada en ningun proveedor');
    }
  });

  it('todos los proveedores declarados pero ninguno disponible: pendiente con razon por proveedor', () => {
    const todosCaidos = providers.map((p) => ({ ...p, available: false, unavailableReason: 'cuota agotada' }));
    const decision = decideRoute('interpret_prompt', todosCaidos);
    expect(decision.status).toBe('pending');
    if (decision.status === 'pending') {
      expect(decision.reason).toContain('ollama(cuota agotada)');
      expect(decision.reason).toContain('nvidia(cuota agotada)');
      // El proveedor de pago no se menciona porque no se pidio milestone review.
      expect(decision.reason).not.toContain('openai');
    }
  });
});
