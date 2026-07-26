"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { updateCommissionStatus } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/format";
import { CommissionResultStatus, Employee } from "@/types/domain";

export interface CommissionComparisonRow {
  employee: Employee;
  liveRevenue: number;
  snapshotRevenue: number | null;
  commissionAmount: number | null;
  totalPay: number | null;
  status: CommissionResultStatus | null;
  isStale: boolean;
}

const NEXT_STATUS: Record<CommissionResultStatus, CommissionResultStatus | null> = {
  pending: "approved",
  approved: "paid",
  paid: null,
};

export function CommissionComparisonTable({ rows, period }: { rows: CommissionComparisonRow[]; period?: string }) {
  const router = useRouter();
  const user = useCurrentUser();
  const { locale, dict } = useLanguage();
  const c = dict.commissions;
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdvance(employeeId: string, status: CommissionResultStatus) {
    const next = NEXT_STATUS[status];
    if (!next || !period) return;
    setPendingEmployeeId(employeeId);
    setError(null);
    try {
      await updateCommissionStatus(employeeId, period, next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPendingEmployeeId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <DataTable<CommissionComparisonRow>
        rowKey={(row) => row.employee.id}
        data={rows}
        emptyMessage={dict.common.noRecords}
        columns={[
          { header: c.employee, cell: (row) => row.employee.name },
          { header: c.employeeDepartment, cell: (row) => row.employee.department },
          { header: c.liveRevenue, cell: (row) => formatCurrency(row.liveRevenue, locale) },
          {
            header: c.snapshotRevenue,
            cell: (row) =>
              row.snapshotRevenue === null ? dict.common.notFound : formatCurrency(row.snapshotRevenue, locale),
          },
          {
            header: c.commissionAmount,
            cell: (row) =>
              row.commissionAmount === null ? dict.common.notFound : formatCurrency(row.commissionAmount, locale),
          },
          {
            header: c.totalPay,
            cell: (row) => (row.totalPay === null ? dict.common.notFound : formatCurrency(row.totalPay, locale)),
          },
          {
            header: c.status,
            cell: (row) => (
              <div className="flex items-center gap-2">
                {row.status ? (
                  <StatusBadge status={row.status} label={dict.status[row.status]} />
                ) : (
                  <span className="text-sm text-slate-500">{c.noResult}</span>
                )}
                {row.isStale && (
                  <span
                    title={c.staleWarning}
                    className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
                  >
                    {c.staleWarning}
                  </span>
                )}
              </div>
            ),
          },
          ...(user?.role === "admin"
            ? [
                {
                  header: "",
                  cell: (row: CommissionComparisonRow) =>
                    row.status && NEXT_STATUS[row.status] ? (
                      <Button
                        variant="ghost"
                        disabled={pendingEmployeeId === row.employee.id}
                        onClick={() => handleAdvance(row.employee.id, row.status as CommissionResultStatus)}
                      >
                        {c.advanceStatus}
                      </Button>
                    ) : null,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
