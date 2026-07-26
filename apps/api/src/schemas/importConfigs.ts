import { employeeSchema, EmployeeInput } from "./employee.schema";
import { revenueSchema, RevenueInput } from "./revenue.schema";
import { invoiceSchema, InvoiceInput } from "./invoice.schema";
import { saleSchema, SaleInput } from "./sale.schema";
import { EntityImportConfig } from "../services/importParsingService";
import { employeeService } from "../services/employeeService";

export type ImportEntity = "employee" | "revenue" | "invoice" | "sale";

/**
 * Aceita tanto "1.500,50" (BR: ponto milhar, vírgula decimal) quanto "1500.50" (formato já
 * numérico/EN). Quando os dois separadores aparecem, o último a ocorrer é o decimal — o outro
 * é milhar e é descartado. Com só vírgula, é tratada como decimal (convenção PT-BR). Com só
 * ponto (ou nenhum separador), o valor já está no formato aceito por `Number()`.
 */
function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return value;

  let str = String(value).trim().replace(/[^0-9.,-]/g, "");
  if (str === "") return undefined;

  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    str = lastComma > lastDot ? str.replace(/\./g, "").replace(",", ".") : str.replace(/,/g, "");
  } else if (lastComma !== -1) {
    str = str.replace(",", ".");
  }

  const parsed = Number(str);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toTrimmedString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

/**
 * Normaliza o período para o formato interno "YYYY-MM", aceitando tanto o formato ISO
 * ("2026-06", ou "2026-06-DD" vindo de datas de célula Excel) quanto os formatos comuns no
 * Brasil: "MM/AAAA" e "DD/MM/AAAA" (o dia é ignorado, só mês/ano importam para o período).
 */
function toPeriod(value: unknown): string | undefined {
  const str = toTrimmedString(value);
  if (!str) return undefined;

  const isoMatch = str.match(/^(\d{4})-(\d{1,2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}`;

  const monthYearMatch = str.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYearMatch) return `${monthYearMatch[2]}-${monthYearMatch[1].padStart(2, "0")}`;

  const fullDateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (fullDateMatch) {
    const [, , month, yearRaw] = fullDateMatch;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month.padStart(2, "0")}`;
  }

  return str;
}

/**
 * Normaliza uma data completa para "YYYY-MM-DD", aceitando ISO (incluindo datas de célula
 * Excel, já convertidas por `cellValue`) e o formato brasileiro "DD/MM/AAAA" (ou "DD/MM/AA").
 */
function toDate(value: unknown): string | undefined {
  const str = toTrimmedString(value);
  if (!str) return undefined;

  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;

  const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (brMatch) {
    const [, day, month, yearRaw] = brMatch;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return str;
}

function periodFromDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const match = date.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : undefined;
}

const STATUS_ALIASES: Record<string, string> = {
  ativo: "active",
  active: "active",
  inativo: "inactive",
  inactive: "inactive",
};

const TIER_ALIASES: Record<string, string> = {
  ouro: "Gold",
  gold: "Gold",
  prata: "Silver",
  silver: "Silver",
};

const INVOICE_STATUS_ALIASES: Record<string, string> = {
  pendente: "pending",
  pending: "pending",
  aprovado: "approved",
  approved: "approved",
  pago: "paid",
  paid: "paid",
};

function mapAlias(value: unknown, aliases: Record<string, string>): string | undefined {
  const str = toTrimmedString(value);
  if (!str) return undefined;
  return aliases[str.toLowerCase()] ?? str;
}

export const employeeImportConfig: EntityImportConfig<EmployeeInput> = {
  schema: employeeSchema,
  fieldLabels: {
    code: "Código",
    name: "Nome",
    role: "Cargo",
    department: "Departamento",
    baseSalary: "Salário base",
    tier: "Tier",
    status: "Status",
  },
  columnAliases: {
    "codigo": "code",
    "code": "code",
    "nome": "name",
    "name": "name",
    "cargo": "role",
    "role": "role",
    "departamento": "department",
    "department": "department",
    "salario base": "baseSalary",
    "salario": "baseSalary",
    "base salary": "baseSalary",
    "tier": "tier",
    "status": "status",
    "situacao": "status",
  },
  coerce: (raw) => ({
    code: toTrimmedString(raw.code),
    name: toTrimmedString(raw.name),
    role: toTrimmedString(raw.role),
    department: toTrimmedString(raw.department),
    baseSalary: toNumber(raw.baseSalary),
    tier: mapAlias(raw.tier, TIER_ALIASES),
    status: mapAlias(raw.status, STATUS_ALIASES),
  }),
};

async function buildEmployeeCodeToIdMap(): Promise<Map<string, string>> {
  const employees = await employeeService.list();
  const map = new Map<string, string>();
  for (const employee of employees) {
    map.set(employee.code.toLowerCase(), employee.id);
    map.set(employee.name.toLowerCase(), employee.id);
    map.set(employee.id.toLowerCase(), employee.id);
  }
  return map;
}

/** Cria um resolvedor de "Funcionário" (código/nome/id) -> id interno, buscando a lista de funcionários uma única vez por importação. */
export function createEmployeeResolver() {
  let mapPromise: Promise<Map<string, string>> | undefined;

  return async function resolveEmployeeReference(
    data: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; error?: { field: string; message: string } }> {
    const raw = toTrimmedString(data.employeeId);
    if (!raw) return { data };
    if (!mapPromise) mapPromise = buildEmployeeCodeToIdMap();
    const map = await mapPromise;
    const resolvedId = map.get(raw.toLowerCase());
    if (!resolvedId) {
      return {
        data: { ...data, employeeId: raw },
        error: { field: "employeeId", message: `Funcionário não encontrado: ${raw}` },
      };
    }
    return { data: { ...data, employeeId: resolvedId } };
  };
}

const revenueImportBase: Omit<EntityImportConfig<RevenueInput>, "resolveRow"> = {
  schema: revenueSchema,
  fieldLabels: {
    employeeId: "Funcionário",
    period: "Período",
    revenueAmount: "Faturamento",
  },
  columnAliases: {
    "funcionario": "employeeId",
    "codigo do funcionario": "employeeId",
    "employee id": "employeeId",
    "employee": "employeeId",
    "periodo": "period",
    "period": "period",
    "faturamento": "revenueAmount",
    "valor": "revenueAmount",
    "revenue amount": "revenueAmount",
  },
  coerce: (raw) => ({
    employeeId: toTrimmedString(raw.employeeId),
    period: toPeriod(raw.period),
    revenueAmount: toNumber(raw.revenueAmount),
  }),
};

const invoiceImportBase: Omit<EntityImportConfig<InvoiceInput>, "resolveRow"> = {
  schema: invoiceSchema,
  fieldLabels: {
    employeeId: "Funcionário",
    period: "Período",
    amount: "Valor",
    status: "Status",
    dueDate: "Vencimento",
    paidDate: "Data de pagamento",
  },
  columnAliases: {
    "funcionario": "employeeId",
    "codigo do funcionario": "employeeId",
    "employee id": "employeeId",
    "employee": "employeeId",
    "periodo": "period",
    "period": "period",
    "valor": "amount",
    "amount": "amount",
    "status": "status",
    "situacao": "status",
    "vencimento": "dueDate",
    "due date": "dueDate",
    "data de pagamento": "paidDate",
    "paid date": "paidDate",
  },
  coerce: (raw) => ({
    employeeId: toTrimmedString(raw.employeeId),
    period: toPeriod(raw.period),
    amount: toNumber(raw.amount),
    status: mapAlias(raw.status, INVOICE_STATUS_ALIASES),
    dueDate: toTrimmedString(raw.dueDate),
    paidDate: toTrimmedString(raw.paidDate),
  }),
};

const saleImportBase: Omit<EntityImportConfig<SaleInput>, "resolveRow"> = {
  schema: saleSchema,
  fieldLabels: {
    employeeId: "Funcionário",
    date: "Data",
    period: "Período",
    store: "Loja",
    itemDescription: "Descrição do item",
    itemSku: "Código do item",
    quantity: "Quantidade",
    grossAmount: "Venda bruta",
    netAmount: "Venda líquida",
  },
  columnAliases: {
    "funcionario": "employeeId",
    "codigo do funcionario": "employeeId",
    "employee id": "employeeId",
    "employee": "employeeId",
    "data": "date",
    "date": "date",
    "loja": "store",
    "store": "store",
    "descricao do item": "itemDescription",
    "item description": "itemDescription",
    "descricao": "itemDescription",
    "codigo do item": "itemSku",
    "item sku": "itemSku",
    "sku": "itemSku",
    "quantidade": "quantity",
    "quantity": "quantity",
    "venda bruta": "grossAmount",
    "gross amount": "grossAmount",
    "venda liquida": "netAmount",
    "net amount": "netAmount",
  },
  coerce: (raw) => {
    const date = toDate(raw.date);
    return {
      employeeId: toTrimmedString(raw.employeeId),
      date,
      period: periodFromDate(date),
      store: toTrimmedString(raw.store),
      itemDescription: toTrimmedString(raw.itemDescription),
      itemSku: toTrimmedString(raw.itemSku),
      quantity: toNumber(raw.quantity) ?? 1,
      grossAmount: toNumber(raw.grossAmount),
      netAmount: toNumber(raw.netAmount),
    };
  },
};

/** Monta os configs de import para uma requisição, com um resolvedor de funcionário compartilhado (1 busca ao banco por importação, não por linha). */
export function buildImportConfigs(): Record<ImportEntity, EntityImportConfig<unknown>> {
  const resolveRow = createEmployeeResolver();
  return {
    employee: employeeImportConfig as EntityImportConfig<unknown>,
    revenue: { ...revenueImportBase, resolveRow } as EntityImportConfig<unknown>,
    invoice: { ...invoiceImportBase, resolveRow } as EntityImportConfig<unknown>,
    sale: { ...saleImportBase, resolveRow } as EntityImportConfig<unknown>,
  };
}

export function isImportEntity(value: string): value is ImportEntity {
  return value === "employee" || value === "revenue" || value === "invoice" || value === "sale";
}

/** Prefixo de id gerado no commit — mesmo formato usado pelos services de CRUD single-record. */
export const ID_PREFIXES: Record<ImportEntity, string> = {
  employee: "emp",
  revenue: "rev",
  invoice: "inv",
  sale: "sale",
};
