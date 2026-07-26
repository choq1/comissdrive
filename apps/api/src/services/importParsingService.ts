import ExcelJS from "exceljs";
import { Readable } from "stream";
import { z } from "zod";

export interface RowError {
  field: string;
  message: string;
}

export interface RowResult<T> {
  rowNumber: number;
  data: Partial<T>;
  errors: RowError[];
}

export interface EntityImportConfig<T> {
  schema: z.ZodSchema<T>;
  /** Rótulo em PT-BR de cada campo do schema, usado nas mensagens de erro por linha. */
  fieldLabels: Record<string, string>;
  /** Cabeçalho normalizado (ver normalizeHeader) -> nome do campo no schema. Cabeçalhos em PT-BR são os canônicos; EN entra como alias. */
  columnAliases: Record<string, string>;
  /** Converte os valores brutos da planilha (string/number/null) para os tipos esperados pelo schema, antes da validação. */
  coerce: (raw: Record<string, unknown>) => Record<string, unknown>;
  /** Hook opcional para resolver referências (ex: código de funcionário -> id interno) antes da validação final. */
  resolveRow?: (data: Record<string, unknown>) => Promise<{ data: Record<string, unknown>; error?: RowError }>;
}

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function cellValue(cell: ExcelJS.Cell): string | number | null {
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "text" in (value as { text?: unknown })) {
    return String((value as { text: unknown }).text);
  }
  if (typeof value === "object" && "result" in (value as { result?: unknown })) {
    return String((value as { result: unknown }).result ?? "");
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" || typeof value === "string") return value;
  return String(value);
}

function translateZodIssue(issue: z.ZodIssue, fieldLabels: Record<string, string>): RowError {
  const field = issue.path.join(".") || "_root";
  const label = fieldLabels[field] ?? field;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        return { field, message: `${label} é obrigatório` };
      }
      return { field, message: `${label} tem um tipo inválido` };
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") return { field, message: `${label} não pode ser vazio` };
      return { field, message: `${label} deve ser maior ou igual a ${issue.minimum}` };
    case z.ZodIssueCode.invalid_enum_value:
      return { field, message: `${label} deve ser um dos valores: ${issue.options.join(", ")}` };
    case z.ZodIssueCode.invalid_string:
      return { field, message: issue.message || `${label} tem um formato inválido` };
    default:
      return { field, message: issue.message || `${label} é inválido` };
  }
}

async function loadWorksheet(buffer: Buffer, mimetype: string, filename: string): Promise<ExcelJS.Worksheet> {
  const isCsv = mimetype.includes("csv") || filename.toLowerCase().endsWith(".csv");
  const workbook = new ExcelJS.Workbook();

  if (isCsv) {
    const worksheet = await workbook.csv.read(Readable.from(buffer));
    return worksheet;
  }

  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("Planilha vazia ou sem abas");
  return worksheet;
}

export async function parseUploadedFile<T>(
  buffer: Buffer,
  mimetype: string,
  filename: string,
  config: EntityImportConfig<T>
): Promise<RowResult<T>[]> {
  const worksheet = await loadWorksheet(buffer, mimetype, filename);

  const headerRow = worksheet.getRow(1);
  const columnFieldByIndex = new Map<number, string>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = normalizeHeader(String(cell.value ?? ""));
    const field = config.columnAliases[header];
    if (field) columnFieldByIndex.set(colNumber, field);
  });

  const results: RowResult<T>[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    const rawByField: Record<string, unknown> = {};
    let hasAnyValue = false;
    columnFieldByIndex.forEach((field, colNumber) => {
      const value = cellValue(row.getCell(colNumber));
      if (value !== null && value !== "") hasAnyValue = true;
      rawByField[field] = value;
    });
    if (!hasAnyValue) continue;

    const coerced = config.coerce(rawByField);
    const resolution = config.resolveRow ? await config.resolveRow(coerced) : { data: coerced };
    const resolved = resolution.data;
    const parsed = config.schema.safeParse(resolved);

    if (parsed.success && !resolution.error) {
      results.push({ rowNumber, data: parsed.data, errors: [] });
    } else {
      const zodErrors = parsed.success
        ? []
        : parsed.error.issues.map((issue) => translateZodIssue(issue, config.fieldLabels));
      const errors = resolution.error ? [resolution.error, ...zodErrors] : zodErrors;
      results.push({ rowNumber, data: resolved as Partial<T>, errors });
    }
  }

  return results;
}
