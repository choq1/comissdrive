import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { calculateCommission } from "./commissionEngine";
import { commissionRuleService } from "./commissionRuleService";
import { employeeService } from "./employeeService";
import { revenueService } from "./revenueService";
import { CommissionResult, CommissionResultStatus } from "../types/domain";

const FROZEN_STATUSES: CommissionResultStatus[] = ["approved", "paid"];
const ALLOWED_TRANSITIONS: Record<CommissionResultStatus, CommissionResultStatus | null> = {
  pending: "approved",
  approved: "paid",
  paid: null,
};

export const commissionResultService = {
  async list(filter: { period?: string; employeeId?: string } = {}): Promise<CommissionResult[]> {
    return prisma.commissionResult.findMany({
      where: {
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      },
    });
  },

  async calculateForPeriod(period: string): Promise<CommissionResult[]> {
    const [employees, revenueRecords, rules, tiers] = await Promise.all([
      employeeService.list(),
      revenueService.list(),
      commissionRuleService.list(),
      commissionRuleService.listTiers(),
    ]);

    const activeEmployees = employees.filter((e) => e.status === "active");

    for (const employee of activeEmployees) {
      const revenueRecord = revenueRecords.find((r) => r.employeeId === employee.id && r.period === period);
      if (!revenueRecord) continue;

      const existing = await prisma.commissionResult.findUnique({
        where: { employeeId_period: { employeeId: employee.id, period } },
      });
      if (existing && FROZEN_STATUSES.includes(existing.status)) continue;

      const { commissionAmount, appliedRules } = calculateCommission(employee, revenueRecord.revenueAmount, rules, tiers);
      const data = {
        baseSalary: employee.baseSalary,
        revenue: revenueRecord.revenueAmount,
        appliedRules,
        commissionAmount,
        totalPay: employee.baseSalary + commissionAmount,
        status: "pending" as CommissionResultStatus,
      };

      await prisma.commissionResult.upsert({
        where: { employeeId_period: { employeeId: employee.id, period } },
        create: { employeeId: employee.id, period, ...data },
        update: data,
      });
    }

    return prisma.commissionResult.findMany({ where: { period } });
  },

  async updateStatus(employeeId: string, period: string, newStatus: CommissionResultStatus): Promise<CommissionResult> {
    const current = await prisma.commissionResult.findUnique({ where: { employeeId_period: { employeeId, period } } });
    if (!current) throw new HttpError(404, "Commission result not found");

    if (ALLOWED_TRANSITIONS[current.status] !== newStatus) {
      throw new HttpError(400, `Invalid status transition from "${current.status}" to "${newStatus}"`);
    }

    return prisma.commissionResult.update({
      where: { employeeId_period: { employeeId, period } },
      data: { status: newStatus },
    });
  },
};
