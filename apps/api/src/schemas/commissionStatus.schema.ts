import { z } from "zod";

export const calculatePeriodSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "period deve estar no formato YYYY-MM"),
});

export const commissionStatusUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "paid"]),
});

export type CalculatePeriodInput = z.infer<typeof calculatePeriodSchema>;
export type CommissionStatusUpdateInput = z.infer<typeof commissionStatusUpdateSchema>;
