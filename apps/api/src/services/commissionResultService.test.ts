import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma";
import { commissionResultService } from "./commissionResultService";
import { employeeService } from "./employeeService";
import { revenueService } from "./revenueService";

// Período fictício e isolado só para este teste, para não colidir com o seed real
// de revenue.json/commissionResults.json (2024-03/04/05) usado pelo frontend.
const PERIOD = "2099-05";
const createdRevenueIds: string[] = [];
let activeEmployeeCount = 0;

beforeAll(async () => {
  const employees = await employeeService.list();
  activeEmployeeCount = employees.filter((e) => e.status === "active").length;
  for (const employee of employees) {
    const revenueAmount = employee.id === "emp_001" ? 80000 : 10000;
    const record = await revenueService.create({ employeeId: employee.id, period: PERIOD, revenueAmount });
    createdRevenueIds.push(record.id);
  }
});

afterAll(async () => {
  for (const id of createdRevenueIds) {
    await revenueService.remove(id);
  }

  await prisma.commissionResult.deleteMany({ where: { period: PERIOD } });
});

describe("commissionResultService", () => {
  it("calculates commission results for every active employee with revenue in the period", async () => {
    const results = await commissionResultService.calculateForPeriod(PERIOD);

    expect(results.length).toBe(activeEmployeeCount);
    expect(results.every((r) => r.status === "pending")).toBe(true);

    const ana = results.find((r) => r.employeeId === "emp_001")!;
    expect(ana.revenue).toBe(80000);
    expect(ana.commissionAmount).toBe(4000 + 1600 + 8500);
    expect(ana.totalPay).toBe(ana.baseSalary + ana.commissionAmount);
  });

  it("moves a result through pending -> approved -> paid and rejects invalid transitions", async () => {
    await expect(commissionResultService.updateStatus("emp_001", PERIOD, "paid")).rejects.toThrow();

    const approved = await commissionResultService.updateStatus("emp_001", PERIOD, "approved");
    expect(approved.status).toBe("approved");

    const paid = await commissionResultService.updateStatus("emp_001", PERIOD, "paid");
    expect(paid.status).toBe("paid");

    await expect(commissionResultService.updateStatus("emp_001", PERIOD, "pending")).rejects.toThrow();
  });

  it("does not overwrite a paid result on recalculation", async () => {
    const before = (await commissionResultService.list({ period: PERIOD, employeeId: "emp_001" }))[0];

    const recalculated = await commissionResultService.calculateForPeriod(PERIOD);
    const after = recalculated.find((r) => r.employeeId === "emp_001")!;

    expect(after).toEqual(before);
    expect(after.status).toBe("paid");
  });
});
