import { randomUUID } from "crypto";
import { describe, expect, it, afterEach } from "vitest";
import { prisma } from "../lib/prisma";
import { recomputeRevenueForPairs } from "./revenueAggregationService";

const employeeId = "emp_001";
const period = "2098-11";

afterEach(async () => {
  await prisma.sale.deleteMany({ where: { employeeId, period } });
  await prisma.revenueRecord.deleteMany({ where: { employeeId, period } });
});

describe("revenueAggregationService.recomputeRevenueForPairs", () => {
  it("soma netAmount de várias vendas do mesmo par funcionário/período em uma única linha de RevenueRecord", async () => {
    await prisma.sale.createMany({
      data: [
        {
          id: `sale_${randomUUID()}`,
          employeeId,
          period,
          date: "2098-11-05",
          store: "Loja A",
          itemDescription: "Item 1",
          quantity: 1,
          grossAmount: 100,
          netAmount: 90,
        },
        {
          id: `sale_${randomUUID()}`,
          employeeId,
          period,
          date: "2098-11-20",
          store: "Loja B",
          itemDescription: "Item 2",
          quantity: 1,
          grossAmount: 200,
          netAmount: 180,
        },
      ],
    });

    await recomputeRevenueForPairs([{ employeeId, period }]);

    const records = await prisma.revenueRecord.findMany({ where: { employeeId, period } });
    expect(records).toHaveLength(1);
    expect(records[0].revenueAmount).toBe(270);
  });

  it("zera o RevenueRecord quando não há mais vendas para o par (upsert com soma 0)", async () => {
    await recomputeRevenueForPairs([{ employeeId, period }]);

    const record = await prisma.revenueRecord.findUnique({
      where: { employeeId_period: { employeeId, period } },
    });
    expect(record?.revenueAmount).toBe(0);
  });

  it("deduplica pares repetidos, gravando uma única linha por par", async () => {
    await prisma.sale.create({
      data: {
        id: `sale_${randomUUID()}`,
        employeeId,
        period,
        date: "2098-11-10",
        store: "Loja A",
        itemDescription: "Item 3",
        quantity: 1,
        grossAmount: 50,
        netAmount: 45,
      },
    });

    await recomputeRevenueForPairs([
      { employeeId, period },
      { employeeId, period },
    ]);

    const records = await prisma.revenueRecord.findMany({ where: { employeeId, period } });
    expect(records).toHaveLength(1);
    expect(records[0].revenueAmount).toBe(45);
  });
});
