import { BudgetStoreAdapter } from './budget-store.adapter';
import { usdToMicroUsd } from '../domain/budget-period.entity';

describe('BudgetStoreAdapter (concurrencia real)', () => {
  it('cero sobreasignacion: 20 reservas concurrentes de $1 contra un limite de $10 -> exactamente 10 aceptadas', async () => {
    const store = new BudgetStoreAdapter();
    const amount = usdToMicroUsd(1);
    const attempts = Array.from({ length: 20 }, () => store.reserve('org-a', 10, amount));
    const results = await Promise.all(attempts);

    const accepted = results.filter((r) => r.ok);
    const rejected = results.filter((r) => !r.ok);
    expect(accepted.length).toBe(10);
    expect(rejected.length).toBe(10);

    const finalState = store.snapshot('org-a');
    expect(finalState?.reservedMicroUsd).toBe(usdToMicroUsd(10));
    // Nunca debe superar el limite, ni por un instante -- se verifica el estado final.
    expect(finalState!.reservedMicroUsd + finalState!.spentMicroUsd).toBeLessThanOrEqual(finalState!.limitMicroUsd);
  });

  it('perfil de US$0 produce CERO reservas exitosas sin importar el monto', async () => {
    const store = new BudgetStoreAdapter();
    const result = await store.reserve('org-cero', 0, usdToMicroUsd(0.000001));
    expect(result.ok).toBe(false);
  });

  it('organizaciones distintas se reservan en paralelo sin bloquearse entre si', async () => {
    const store = new BudgetStoreAdapter();
    const start = Date.now();
    await Promise.all([
      store.reserve('org-x', 25, usdToMicroUsd(5)),
      store.reserve('org-y', 25, usdToMicroUsd(5)),
    ]);
    // No es una prueba de tiempo estricta -- solo confirma que ambas se resolvieron y que
    // el estado de una organizacion no afecto a la otra.
    expect(store.snapshot('org-x')?.reservedMicroUsd).toBe(usdToMicroUsd(5));
    expect(store.snapshot('org-y')?.reservedMicroUsd).toBe(usdToMicroUsd(5));
    expect(Date.now() - start).toBeLessThan(2000);
  });

  it('commit mueve de reservado a gastado sin cambiar el total ocupado', async () => {
    const store = new BudgetStoreAdapter();
    await store.reserve('org-b', 10, usdToMicroUsd(3));
    const after = await store.commit('org-b', usdToMicroUsd(3));
    expect(after.reservedMicroUsd).toBe(0n);
    expect(after.spentMicroUsd).toBe(usdToMicroUsd(3));
  });

  it('release libera la reserva sin registrar gasto (ej. la llamada al modelo fallo)', async () => {
    const store = new BudgetStoreAdapter();
    await store.reserve('org-c', 10, usdToMicroUsd(4));
    const after = await store.release('org-c', usdToMicroUsd(4));
    expect(after.reservedMicroUsd).toBe(0n);
    expect(after.spentMicroUsd).toBe(0n);
  });
});
