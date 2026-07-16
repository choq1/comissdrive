import { z } from "zod";

export const revenueSchema = z.object({
  employeeId: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/, "period deve estar no formato YYYY-MM"),
  revenueAmount: z.number().nonnegative(),
});

export const revenueUpdateSchema = revenueSchema.partial();

export type RevenueInput = z.infer<typeof revenueSchema>;
export type RevenueUpdateInput = z.infer<typeof revenueUpdateSchema>;
