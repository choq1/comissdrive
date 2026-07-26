import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { ImportEntity, ID_PREFIXES, buildImportConfigs } from "../schemas/importConfigs";
import { RowError } from "./importParsingService";
import { recomputeRevenueForPairs } from "./revenueAggregationService";

export interface CommitRowError {
  rowIndex: number;
  errors: RowError[];
}

export interface CommitResult {
  committed: number;
  failed: number;
  errors: CommitRowError[];
}

function createOne(entity: ImportEntity, data: Record<string, unknown>) {
  const id = `${ID_PREFIXES[entity]}_${randomUUID()}`;

  switch (entity) {
    case "employee":
      return prisma.employee.create({ data: { ...data, id } as never });
    case "revenue": {
      // upsert, não create: RevenueRecord é único por (employeeId, period) — reimportar a
      // mesma planilha ou um par já existente atualiza o valor em vez de falhar/duplicar.
      const { employeeId, period } = data as { employeeId: string; period: string };
      return prisma.revenueRecord.upsert({
        where: { employeeId_period: { employeeId, period } },
        create: { ...data, id } as never,
        update: data as never,
      });
    }
    case "invoice":
      return prisma.invoice.create({ data: { ...data, id } as never });
    case "sale":
      return prisma.sale.create({ data: { ...data, id } as never });
  }
}

export async function commitImport(
  entity: ImportEntity,
  rows: unknown[],
  context: { fileName: string; uploadedBy: string; source: "spreadsheet" | "ocr" }
): Promise<CommitResult> {
  // Mesmo pipeline coerce -> resolveRow -> schema do preview (importParsingService.parseUploadedFile),
  // pra que uma correção manual na tela (ex: "Funcionário" digitado errado) seja barrada aqui também,
  // não só na planilha original.
  const config = buildImportConfigs()[entity];

  const goodRows: { index: number; data: Record<string, unknown> }[] = [];
  const badRows: CommitRowError[] = [];

  for (let index = 0; index < rows.length; index++) {
    const coerced = config.coerce(rows[index] as Record<string, unknown>);
    const resolution = config.resolveRow ? await config.resolveRow(coerced) : { data: coerced };
    const parsed = config.schema.safeParse(resolution.data);

    if (parsed.success && !resolution.error) {
      goodRows.push({ index, data: parsed.data as Record<string, unknown> });
    } else {
      const zodErrors = parsed.success
        ? []
        : parsed.error.issues.map((issue) => ({
            field: issue.path.join(".") || "_root",
            message: `${config.fieldLabels[issue.path.join(".")] ?? issue.path.join(".")}: ${issue.message}`,
          }));
      badRows.push({ rowIndex: index, errors: resolution.error ? [resolution.error, ...zodErrors] : zodErrors });
    }
  }

  const created =
    goodRows.length > 0
      ? await prisma.$transaction(goodRows.map((row) => createOne(entity, row.data)))
      : [];

  if (entity === "sale" && created.length > 0) {
    const pairs = goodRows.map((row) => ({
      employeeId: row.data.employeeId as string,
      period: row.data.period as string,
    }));
    await recomputeRevenueForPairs(pairs);
  }

  await prisma.importLog.create({
    data: {
      id: `implog_${randomUUID()}`,
      entity,
      source: context.source,
      fileName: context.fileName,
      uploadedBy: context.uploadedBy,
      rowsTotal: rows.length,
      rowsCommitted: created.length,
      rowsFailed: badRows.length,
    },
  });

  return { committed: created.length, failed: badRows.length, errors: badRows };
}
