import { z } from "zod";

export const commissionRuleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["base", "volumeBonus", "tiered"]),
  scope: z.enum(["department", "role", "global"]),
  appliesTo: z.string().min(1).nullable(),
  percentage: z.number().nonnegative(),
  threshold: z.number().nonnegative().nullable(),
});

export const commissionRuleUpdateSchema = commissionRuleSchema.partial();

export type CommissionRuleInput = z.infer<typeof commissionRuleSchema>;
export type CommissionRuleUpdateInput = z.infer<typeof commissionRuleUpdateSchema>;
