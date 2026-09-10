// M02 — dominio: presupuesto de supervision por hitos. Montos en microdolares enteros
// (regla 3.5 del diseno: nunca float). Perfiles por defecto: US$0, US$10, US$25 --
// cambiables por administrador, pero estos son los defaults declarados en el diseno
// original, no una decision nueva inventada aqui.
export interface BudgetPeriod {
  organizationId: string;
  limitMicroUsd: bigint;
  reservedMicroUsd: bigint;
  spentMicroUsd: bigint;
}

export const DEFAULT_BUDGET_PROFILES_USD = [0, 10, 25] as const;

export function usdToMicroUsd(usd: number): bigint {
  return BigInt(Math.round(usd * 1_000_000));
}

export function createBudgetPeriod(organizationId: string, limitUsd: number): BudgetPeriod {
  return { organizationId, limitMicroUsd: usdToMicroUsd(limitUsd), reservedMicroUsd: 0n, spentMicroUsd: 0n };
}

export type ReservationResult =
  | { ok: true; period: BudgetPeriod }
  | { ok: false; reason: string };

// Funcion pura: dado el estado actual y un monto a reservar, decide si cabe dentro del
// limite. reserved+spent+amount <= limit, nunca al reves (nunca se reserva "optimista"
// y se corrige despues -- eso es exactamente lo que permite sobreasignacion).
export function reserveBudget(period: BudgetPeriod, amountMicroUsd: bigint): ReservationResult {
  if (amountMicroUsd <= 0n) return { ok: false, reason: 'el monto a reservar debe ser positivo' };
  const projected = period.reservedMicroUsd + period.spentMicroUsd + amountMicroUsd;
  if (projected > period.limitMicroUsd) {
    return { ok: false, reason: `excede el presupuesto: reservado=${period.reservedMicroUsd} + gastado=${period.spentMicroUsd} + solicitado=${amountMicroUsd} > limite=${period.limitMicroUsd}` };
  }
  return { ok: true, period: { ...period, reservedMicroUsd: period.reservedMicroUsd + amountMicroUsd } };
}

export function commitSpend(period: BudgetPeriod, amountMicroUsd: bigint): BudgetPeriod {
  const releasedFromReserved = amountMicroUsd < period.reservedMicroUsd ? amountMicroUsd : period.reservedMicroUsd;
  return {
    ...period,
    reservedMicroUsd: period.reservedMicroUsd - releasedFromReserved,
    spentMicroUsd: period.spentMicroUsd + amountMicroUsd,
  };
}

export function releaseReservation(period: BudgetPeriod, amountMicroUsd: bigint): BudgetPeriod {
  const released = amountMicroUsd < period.reservedMicroUsd ? amountMicroUsd : period.reservedMicroUsd;
  return { ...period, reservedMicroUsd: period.reservedMicroUsd - released };
}
