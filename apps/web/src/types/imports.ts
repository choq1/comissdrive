export type ImportEntity = "employee" | "revenue" | "invoice" | "sale";

export interface RowError {
  field: string;
  message: string;
}

export interface RowResult {
  rowNumber: number;
  data: Record<string, unknown>;
  errors: RowError[];
}

export interface ImportPreviewResponse {
  entity: ImportEntity;
  fileName: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: RowResult[];
}

export interface ImportCommitResponse {
  entity: ImportEntity;
  committed: number;
  failed: number;
  errors: { rowIndex: number; errors: RowError[] }[];
}
