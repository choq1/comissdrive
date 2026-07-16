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
    await writeData(FILE, data);
    return true;
  },
};
