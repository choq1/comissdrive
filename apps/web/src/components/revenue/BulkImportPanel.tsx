"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileInput } from "@/components/ui/FileInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { previewImport, commitImportRows } from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImportCommitResponse, ImportEntity, ImportPreviewResponse, RowResult } from "@/types/imports";

const ENTITY_FIELDS: Record<ImportEntity, string[]> = {
  employee: ["code", "name", "role", "department", "baseSalary", "tier", "status"],
  revenue: ["employeeId", "period", "revenueAmount"],
  invoice: ["employeeId", "period", "amount", "status", "dueDate", "paidDate"],
  sale: ["employeeId", "date", "store", "itemDescription", "itemSku", "quantity", "grossAmount", "netAmount"],
};

export function BulkImportPanel() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.revenue.imports;

  const [entity, setEntity] = useState<ImportEntity>("sale");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [result, setResult] = useState<ImportCommitResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = ENTITY_FIELDS[entity];

  function resetAnalysis() {
    setPreview(null);
    setRows([]);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await previewImport(entity, file);
      setPreview(response);
      setRows(response.rows);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  }

  function updateCell(rowNumber: number, field: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.rowNumber === rowNumber ? { ...row, data: { ...row.data, [field]: value } } : row))
    );
  }

  async function handleConfirm() {
    if (!preview) return;
    setConfirming(true);
    try {
      const response = await commitImportRows(
        entity,
        rows.map((row) => row.data),
        preview.fileName
      );
      setResult(response);
      router.refresh();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-base font-semibold text-slate-100">{t.heading}</h2>

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label={t.entity}
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value as ImportEntity);
            setFile(null);
            resetAnalysis();
          }}
          options={[
            { value: "sale", label: t.entitySale },
            { value: "revenue", label: t.entityRevenue },
            { value: "employee", label: t.entityEmployee },
            { value: "invoice", label: t.entityInvoice },
          ]}
        />
        <FileInput
          label={t.chooseFile}
          accept=".xlsx,.xls,.csv"
          onChange={(f) => {
            setFile(f);
            resetAnalysis();
          }}
        />
        <Button onClick={handleAnalyze} disabled={!file || analyzing}>
          {analyzing ? t.analyzing : t.analyze}
        </Button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {preview && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-400">
            {t.summary.replace("{valid}", String(preview.validCount)).replace("{total}", String(preview.totalRows))}
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">{t.rowNumber}</th>
                  {fields.map((field) => (
                    <th key={field} className="px-3 py-2">
                      {t.fields[field as keyof typeof t.fields]}
                    </th>
                  ))}
                  <th className="px-3 py-2">{t.errors}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const hasErrors = row.errors.length > 0;
                  return (
                    <tr key={row.rowNumber} className={hasErrors ? "bg-rose-500/10" : undefined}>
                      <td className="px-3 py-2 text-slate-400">{row.rowNumber}</td>
                      {fields.map((field) => {
                        const fieldHasError = row.errors.some((e) => e.field === field);
                        return (
                          <td key={field} className="px-3 py-2">
                            <input
                              value={String(row.data[field] ?? "")}
                              onChange={(e) => updateCell(row.rowNumber, field, e.target.value)}
                              className={`w-full rounded-md border bg-slate-950/40 px-2 py-1 text-slate-200 outline-none ${
                                fieldHasError ? "border-rose-500" : "border-slate-800"
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-xs text-rose-400">
                        {row.errors.map((e) => e.message).join("; ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <Button onClick={handleConfirm} disabled={confirming || rows.length === 0}>
              {confirming ? t.confirming : t.confirmImport}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm">
          <p className="font-medium text-slate-100">{t.resultSummary}</p>
          <p className="text-slate-300">
            {result.committed} {t.committed} · {result.failed} {t.failed}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-rose-400">
              {result.errors.map((rowError) => (
                <li key={rowError.rowIndex}>{rowError.errors.map((e) => e.message).join("; ")}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
