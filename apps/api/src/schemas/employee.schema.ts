import { z } from "zod";

export const employeeSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().min(1),
  baseSalary: z.number().nonnegative(),
  tier: z.enum(["Gold", "Silver"]),
  status: z.enum(["active", "inactive"]),
});

export const employeeUpdateSchema = employeeSchema.partial();

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
