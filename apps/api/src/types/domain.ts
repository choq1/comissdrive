// Tipos de domínio compartilhados com o frontend. Ver modelo de dados em CLAUDE.md (raiz do projeto).

export type CommissionTierLevel = "Gold" | "Silver";
export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  baseSalary: number;
  tier: CommissionTierLevel;
  status: EmployeeStatus;
}

export interface RevenueRecord {
  id: string;
  employeeId: string;
  period: string; // YYYY-MM
  revenueAmount: number;
}

export interface Sale {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  period: string; // YYYY-MM, derivado de `date`
  store: string;
  itemDescription: string;
  itemSku?: string | null;
  quantity: number;
  grossAmount: number;
  netAmount: number;
}

export type CommissionRuleType = "base" | "volumeBonus" | "tiered";
export type CommissionRuleScope = "department" | "role" | "global";

export interface CommissionRule {
  id: string;
  name: string;
  type: CommissionRuleType;
  scope: CommissionRuleScope;
  /** Valor alvo do scope (ex: nome do department/role). null quando scope === "global". */
  appliesTo: string | null;
  percentage: number;
  threshold: number | null;
}

export interface CommissionTier {
  id: string;
  ruleId: string;
  tierName: string;
  minRevenue: number;
  maxRevenue: number | null;
  percentage: number;
}

export type CommissionResultStatus = "pending" | "approved" | "paid";

export interface CommissionResult {
  employeeId: string;
  period: string;
  baseSalary: number;
  revenue: number;
  appliedRules: string[];
  commissionAmount: number;
  totalPay: number;
  status: CommissionResultStatus;
}

export type InvoiceStatus = "pending" | "approved" | "paid";

export interface Invoice {
  id: string;
  employeeId: string;
  period: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string | null;
}

export type UserRole = "admin" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string | null;
  passwordHash: string;
}

/** Shape que a API devolve nas respostas HTTP — nunca inclui passwordHash. */
export type PublicUser = Omit<User, "passwordHash">;

export type ImportSource = "spreadsheet" | "ocr";

export interface ImportLog {
  id: string;
  entity: string;
  source: ImportSource;
  fileName: string;
  uploadedBy: string;
  rowsTotal: number;
  rowsCommitted: number;
  rowsFailed: number;
  createdAt: string;
}
