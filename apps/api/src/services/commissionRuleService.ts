import { randomUUID } from "crypto";
import { readData, writeData } from "../lib/jsonStore";
import { CommissionRule, CommissionTier } from "../types/domain";

const FILE = "rules.json";

interface RulesFile {
  rules: CommissionRule[];
  tiers: CommissionTier[];
}

export const commissionRuleService = {
  async list(): Promise<CommissionRule[]> {
    const { rules } = await readData<RulesFile>(FILE);
    return rules;
  },

  async listTiers(): Promise<CommissionTier[]> {
    const { tiers } = await readData<RulesFile>(FILE);
    return tiers;
  },

  async findById(id: string): Promise<CommissionRule | undefined> {
    const { rules } = await readData<RulesFile>(FILE);
    return rules.find((rule) => rule.id === id);
  },

  async create(input: Omit<CommissionRule, "id">): Promise<CommissionRule> {
    const data = await readData<RulesFile>(FILE);
    const created: CommissionRule = { ...input, id: `rule_${randomUUID()}` };
    data.rules.push(created);
    await writeData(FILE, data);
    return created;
  },

  async update(id: string, patch: Partial<Omit<CommissionRule, "id">>): Promise<CommissionRule | undefined> {
    const data = await readData<RulesFile>(FILE);
    const index = data.rules.findIndex((rule) => rule.id === id);
    if (index === -1) return undefined;

    const updated = { ...data.rules[index], ...patch, id } as CommissionRule;
    data.rules[index] = updated;
    await writeData(FILE, data);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData<RulesFile>(FILE);
    const filtered = data.rules.filter((rule) => rule.id !== id);
    if (filtered.length === data.rules.length) return false;

    data.rules = filtered;
    data.tiers = data.tiers.filter((tier) => tier.ruleId !== id);
    await writeData(FILE, data);
    return true;
  },

  async createTier(input: Omit<CommissionTier, "id">): Promise<CommissionTier> {
    const data = await readData<RulesFile>(FILE);
    const created: CommissionTier = { ...input, id: `tier_${randomUUID()}` };
    data.tiers.push(created);
    await writeData(FILE, data);
    return created;
  },

  async updateTier(id: string, patch: Partial<Omit<CommissionTier, "id">>): Promise<CommissionTier | undefined> {
    const data = await readData<RulesFile>(FILE);
    const index = data.tiers.findIndex((tier) => tier.id === id);
    if (index === -1) return undefined;

    const updated = { ...data.tiers[index], ...patch, id } as CommissionTier;
    data.tiers[index] = updated;
    await writeData(FILE, data);
    return updated;
  },

  async removeTier(id: string): Promise<boolean> {
    const data = await readData<RulesFile>(FILE);
    const filtered = data.tiers.filter((tier) => tier.id !== id);
    if (filtered.length === data.tiers.length) return false;

    data.tiers = filtered;
    await writeData(FILE, data);
    return true;
  },
};
