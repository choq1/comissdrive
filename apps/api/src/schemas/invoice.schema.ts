import { z } from "zod";

export const invoiceSchema = z.object({
  employeeId: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/, "period deve estar no formato YYYY-MM"),
  amount: z.number().nonnegative(),
  status: z.enum(["pending", "approved", "paid"]),
  dueDate: z.string().min(1),
  paidDate: z.string().min(1).optional(),
});

export const invoiceUpdateSchema = invoiceSchema.partial();

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
