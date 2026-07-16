import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CommissionGrowthChart } from "@/components/dashboard/CommissionGrowthChart";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { getCommissionResults, getEmployees } from "@/lib/api";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { CommissionResult } from "@/types/domain";

export default async function DashboardPage() {
  const [employees, commissionResults] = await Promise.all([getEmployees(), getCommissionResults()]);

  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;

  const periods = Array.from(new Set(commissionResults.map((r) => r.period))).sort();
  const latestPeriod = periods.at(-1);

  const totalPaid = commissionResults
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const growthData = periods.map((period) => ({
    period,
    label: formatPeriodLabel(period),
    total: commissionResults.filter((r) => r.period === period).reduce((sum, r) => sum + r.commissionAmount, 0),
  }));

  const topPerformers = commissionResults
    .filter((r) => r.period === latestPeriod)
    .slice()
    .sort((a, b) => b.commissionAmount - a.commissionAmount)
    .slice(0, 4)
    .map((r) => ({ employeeId: r.employeeId, name: employeeName(r.employeeId), commissionAmount: r.commissionAmount }));

  const recentPayments = commissionResults
    .filter((r) => r.status === "paid")
    .slice()
    .sort((a, b) => (a.period < b.period ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 gap-4 px-8 md:grid-cols-3">
        <KpiCard label="Total Commissions Paid" value={formatCurrency(totalPaid)} badge="+ Positive" />
        <KpiCard
          label="Latest Period"
          value={latestPeriod ? formatPeriodLabel(latestPeriod) : "—"}
          hint="Último período calculado pelo motor de comissão"
        />
        <TopPerformers performers={topPerformers} />
      </div>

      <div className="px-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Commission Growth</h2>
          <CommissionGrowthChart data={growthData} />
        </div>
      </div>

      <div className="px-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">Recent Commission Payments</h2>
        <DataTable<CommissionResult>
          rowKey={(row) => `${row.employeeId}_${row.period}`}
          data={recentPayments}
          columns={[
            { header: "Period", cell: (row) => formatPeriodLabel(row.period) },
            { header: "Employee", cell: (row) => employeeName(row.employeeId) },
            { header: "Commission", cell: (row) => formatCurrency(row.commissionAmount) },
            { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
