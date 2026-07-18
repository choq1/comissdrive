import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { CommissionRule, CommissionTier } from "../types/domain";

export const commissionRuleService = {
  async list(): Promise<CommissionRule[]> {
    return prisma.commissionRule.findMany();
  },

  async listTiers(): Promise<CommissionTier[]> {
    return prisma.commissionTier.findMany();
  },

  async findById(id: string): Promise<CommissionRule | undefined> {
    const rule = await prisma.commissionRule.findUnique({ where: { id } });
    return rule ?? undefined;
  },

  async create(input: Omit<CommissionRule, "id">): Promise<CommissionRule> {
    return prisma.commissionRule.create({ data: { ...input, id: `rule_${randomUUID()}` } });
  },

  async update(id: string, patch: Partial<Omit<CommissionRule, "id">>): Promise<CommissionRule | undefined> {
    try {
      return await prisma.commissionRule.update({ where: { id }, data: patch });
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      // Tiers da rule são removidos em cascata pela FK (onDelete: Cascade no schema).
      await prisma.commissionRule.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async createTier(input: Omit<CommissionTier, "id">): Promise<CommissionTier> {
    return prisma.commissionTier.create({ data: { ...input, id: `tier_${randomUUID()}` } });
  },

  async updateTier(id: string, patch: Partial<Omit<CommissionTier, "id">>): Promise<CommissionTier | undefined> {
    try {
      return await prisma.commissionTier.update({ where: { id }, data: patch });
    } catch {
      return undefined;
    }
  },

  async removeTier(id: string): Promise<boolean> {
    try {
      await prisma.commissionTier.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
