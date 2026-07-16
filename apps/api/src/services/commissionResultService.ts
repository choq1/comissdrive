import { readData, writeData } from "../lib/jsonStore";
import { HttpError } from "../middleware/errorHandler";
import { calculateCommission } from "./commissionEngine";
import { commissionRuleService } from "./commissionRuleService";
import { employeeService } from "./employeeService";
import { revenueService } from "./revenueService";
import { CommissionResult, CommissionResultStatus } from "../types/domain";

const FILE = "commissionResults.json";

const FROZEN_STATUSES: CommissionResultStatus[] = ["approved", "paid"];
const ALLOWED_TRANSITIONS: Record<CommissionResultStatus, CommissionResultStatus | null> = {
  pending: "approved",
  approved: "paid",
  paid: null,
};

export const commissionResultService = {
  async list(filter: { period?: string; employeeId?: string } = {}): Promise<CommissionResult[]> {
    const results = await readData<CommissionResult[]>(FILE);
    return results.filter(
      (r) => (!filter.period || r.period === filter.period) && (!filter.employeeId || r.employeeId === filter.employeeId)
    );
  },

  async calculateForPeriod(period: string): Promise<CommissionResult[]> {
    const [employees, revenueRecords, rules, tiers, existingResults] = await Promise.all([
      employeeService.list(),
      revenueService.list(),
      commissionRuleService.list(),
      commissionRuleService.listTiers(),
      readData<CommissionResult[]>(FILE),
    ]);

    const activeEmployees = employees.filter((e) => e.status === "active");
    const results = [...existingResults];

    for (const employee of activeEmployees) {
      const revenueRecord = revenueRecords.find((r) => r.employeeId === employee.id && r.period === period);
      if (!revenueRecord) continue;

      const existingIndex = results.findIndex((r) => r.employeeId === employee.id && r.period === period);
      if (existingIndex !== -1 && FROZEN_STATUSES.includes(results[existingIndex].status)) {
        continue;
      }

      const { commissionAmount, appliedRules } = calculateCommission(employee, revenueRecord.revenueAmount, rules, tiers);
      const result: CommissionResult = {
        employeeId: employee.id,
        period,
        baseSalary: employee.baseSalary,
        revenue: revenueRecord.revenueAmount,
        appliedRules,
        commissionAmount,
        totalPay: employee.baseSalary + commissionAmount,
        status: "pending",
      };

      if (existingIndex !== -1) {
        results[existingIndex] = result;
      } else {
        results.push(result);
      }
    }

    await writeData(FILE, results);
    return results.filter((r) => r.period === period);
  },

  async updateStatus(employeeId: string, period: string, newStatus: CommissionResultStatus): Promise<CommissionResult> {
    const results = await readData<CommissionResult[]>(FILE);
    const index = results.findIndex((r) => r.employeeId === employeeId && r.period === period);
    if (index === -1) throw new HttpError(404, "Commission result not found");

    const current = results[index].status;
    if (ALLOWED_TRANSITIONS[current] !== newStatus) {
      throw new HttpError(400, `Invalid status transition from "${current}" to "${newStatus}"`);
    }

    results[index] = { ...results[index], status: newStatus };
    await writeData(FILE, results);
    return results[index];
  },
};
