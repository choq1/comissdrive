import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";

export interface EmployeePeriodPair {
  employeeId: string;
  period: string;
}

function dedupePairs(pairs: EmployeePeriodPair[]): EmployeePeriodPair[] {
  const seen = new Map<string, EmployeePeriodPair>();
  for (const pair of pairs) {
    seen.set(`${pair.employeeId}|${pair.period}`, pair);
  }
  return Array.from(seen.values());
}

/**
 * Recalcula `RevenueRecord.revenueAmount` (soma de `Sale.netAmount`) para cada par
 * funcionário/período afetado por uma escrita em `Sale` — CRUD manual ou commit de import.
 * Usa `upsert` (constraint `@@unique([employeeId, period])`) para manter 1 linha por par.
 */
export async function recomputeRevenueForPairs(pairs: EmployeePeriodPair[]): Promise<void> {
  const uniquePairs = dedupePairs(pairs);

  for (const { employeeId, period } of uniquePairs) {
    const { _sum } = await prisma.sale.aggregate({
      where: { employeeId, period },
      _sum: { netAmount: true },
    });
    const revenueAmount = _sum.netAmount ?? 0;

    await prisma.revenueRecord.upsert({
      where: { employeeId_period: { employeeId, period } },
      create: { id: `rev_${randomUUID()}`, employeeId, period, revenueAmount },
      update: { revenueAmount },
    });
  }
}
