import { z } from "zod";

export const saleSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date deve estar no formato YYYY-MM-DD"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "period deve estar no formato YYYY-MM"),
  store: z.string().min(1),
  itemDescription: z.string().min(1),
  itemSku: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
  grossAmount: z.number().nonnegative(),
  netAmount: z.number().nonnegative(),
});

export const saleUpdateSchema = saleSchema.partial();

export type SaleInput = z.infer<typeof saleSchema>;
export type SaleUpdateInput = z.infer<typeof saleUpdateSchema>;
