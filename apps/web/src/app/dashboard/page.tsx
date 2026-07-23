import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CommissionGrowthChart } from "@/components/dashboard/CommissionGrowthChart";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { getCommissionResults, getEmployees } from "@/lib/api";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { CommissionResult } from "@/types/domain";

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const dict = dictionaries[locale];
  const [employees, commissionResults] = await Promise.all([getEmployees(), getCommissionResults()]);

  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;

  const periods = Array.from(new Set(commissionResults.map((r) => r.period))).sort();
  const latestPeriod = periods.at(-1);

  const totalPaid = commissionResults
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const growthData = periods.map((period) => ({
    period,
    label: formatPeriodLabel(period, locale),
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
      <PageHeader title={dict.dashboard.title} />

      <div className="grid grid-cols-1 gap-4 px-8 md:grid-cols-3">
        <KpiCard
          label={dict.dashboard.totalCommissionsPaid}
          value={formatCurrency(totalPaid, locale)}
          badge={dict.common.positive}
        />
        <KpiCard
          label={dict.dashboard.latestPeriod}
          value={latestPeriod ? formatPeriodLabel(latestPeriod, locale) : dict.common.notFound}
          hint={dict.dashboard.latestPeriodHint}
        />
        <TopPerformers performers={topPerformers} dict={dict} locale={locale} />
      </div>

      <div className="px-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">{dict.dashboard.commissionGrowth}</h2>
          <CommissionGrowthChart data={growthData} />
        </div>
      </div>

      <div className="px-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">{dict.dashboard.recentPayments}</h2>
        <DataTable<CommissionResult>
          rowKey={(row) => `${row.employeeId}_${row.period}`}
          data={recentPayments}
          emptyMessage={dict.common.noRecords}
          columns={[
            { header: dict.dashboard.tablePeriod, cell: (row) => formatPeriodLabel(row.period, locale) },
            { header: dict.dashboard.tableEmployee, cell: (row) => employeeName(row.employeeId) },
            { header: dict.dashboard.tableCommission, cell: (row) => formatCurrency(row.commissionAmount, locale) },
            {
              header: dict.dashboard.tableStatus,
              cell: (row) => <StatusBadge status={row.status} label={dict.status[row.status]} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
