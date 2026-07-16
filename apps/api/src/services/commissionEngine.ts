import { CommissionRule, CommissionTier, Employee } from "../types/domain";

export interface CommissionCalculationResult {
  commissionAmount: number;
  appliedRules: string[];
}

function ruleMatches(rule: CommissionRule, employee: Employee): boolean {
  if (rule.scope === "global") return true;
  if (rule.scope === "department") return rule.appliesTo === employee.department;
  if (rule.scope === "role") return rule.appliesTo === employee.role;
  return false;
}

function progressiveTierAmount(tiers: CommissionTier[], revenueAmount: number): number {
  return tiers.reduce((total, tier) => {
    const lower = tier.minRevenue;
    const upper = tier.maxRevenue ?? Infinity;
    if (revenueAmount <= lower) return total;

    const taxable = Math.min(revenueAmount, upper) - lower;
    return total + taxable * (tier.percentage / 100);
  }, 0);
}

export function calculateCommission(
  employee: Employee,
  revenueAmount: number,
  rules: CommissionRule[],
  tiers: CommissionTier[]
): CommissionCalculationResult {
  const applicableRules = rules.filter((rule) => ruleMatches(rule, employee));
  const appliedRules: string[] = [];
  let commissionAmount = 0;

  for (const rule of applicableRules) {
    let contribution = 0;

    if (rule.type === "base") {
      contribution = revenueAmount * (rule.percentage / 100);
    } else if (rule.type === "volumeBonus") {
      if (rule.threshold != null && revenueAmount > rule.threshold) {
        contribution = revenueAmount * (rule.percentage / 100);
      }
    } else if (rule.type === "tiered") {
      const ruleTiers = tiers.filter((tier) => tier.ruleId === rule.id);
      contribution = progressiveTierAmount(ruleTiers, revenueAmount);
    }

    if (contribution > 0) {
      commissionAmount += contribution;
      appliedRules.push(rule.id);
    }
  }

  return { commissionAmount, appliedRules };
}
