import { describe, expect, it } from "vitest";
import { calculateCommission } from "./commissionEngine";
import { CommissionRule, CommissionTier, Employee } from "../types/domain";

const salesEmployee: Employee = {
  id: "emp_test",
  code: "E999",
  name: "Test Seller",
  role: "Sales Executive",
  department: "Sales",
  baseSalary: 3000,
  tier: "Gold",
  status: "active",
};

const baseRule: CommissionRule = {
  id: "rule_base",
  name: "Base Rule - Sales",
  type: "base",
  scope: "department",
  appliesTo: "Sales",
  percentage: 5,
  threshold: null,
};

const volumeRule: CommissionRule = {
  id: "rule_volume",
  name: "Volume Bonus - Sales",
  type: "volumeBonus",
  scope: "department",
  appliesTo: "Sales",
  percentage: 2,
  threshold: 50000,
};

const tieredRule: CommissionRule = {
  id: "rule_tiered",
  name: "Tiered Structure - Sales",
  type: "tiered",
  scope: "department",
  appliesTo: "Sales",
  percentage: 0,
  threshold: null,
};

const tiers: CommissionTier[] = [
  { id: "tier_1", ruleId: "rule_tiered", tierName: "Tier 1", minRevenue: 0, maxRevenue: 50000, percentage: 5 },
  { id: "tier_2", ruleId: "rule_tiered", tierName: "Tier 2", minRevenue: 50000, maxRevenue: null, percentage: 20 },
];

describe("calculateCommission", () => {
  it("applies only the base rule when revenue is low", () => {
    const result = calculateCommission(salesEmployee, 10000, [baseRule], []);
    expect(result.commissionAmount).toBe(500);
    expect(result.appliedRules).toEqual(["rule_base"]);
  });

  it("does not apply volume bonus below the threshold", () => {
    const result = calculateCommission(salesEmployee, 40000, [baseRule, volumeRule], []);
    expect(result.commissionAmount).toBe(2000);
    expect(result.appliedRules).toEqual(["rule_base"]);
  });

  it("applies volume bonus above the threshold", () => {
    const result = calculateCommission(salesEmployee, 60000, [baseRule, volumeRule], []);
    expect(result.commissionAmount).toBe(60000 * 0.05 + 60000 * 0.02);
    expect(result.appliedRules).toEqual(["rule_base", "rule_volume"]);
  });

  it("calculates tiers progressively (tax-bracket style)", () => {
    const result = calculateCommission(salesEmployee, 80000, [baseRule, volumeRule, tieredRule], tiers);

    // base: 80000 * 5% = 4000
    // volume bonus: 80000 * 2% = 1600
    // tiers: 50000 * 5% + 30000 * 20% = 2500 + 6000 = 8500
    expect(result.commissionAmount).toBe(4000 + 1600 + 8500);
    expect(result.appliedRules).toEqual(["rule_base", "rule_volume", "rule_tiered"]);
  });

  it("ignores rules that do not match the employee's scope", () => {
    const otherDeptRule: CommissionRule = {
      ...baseRule,
      id: "rule_other",
      appliesTo: "Account Mgmt",
    };

    const result = calculateCommission(salesEmployee, 10000, [otherDeptRule], []);
    expect(result.commissionAmount).toBe(0);
    expect(result.appliedRules).toEqual([]);
  });
});
