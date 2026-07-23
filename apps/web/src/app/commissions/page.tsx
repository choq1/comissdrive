import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TopCommissionedBarChart } from "@/components/commissions/TopCommissionedBarChart";
import { DepartmentPieChart } from "@/components/commissions/DepartmentPieChart";
import { getCommissionResults, getEmployees, getInvoices } from "@/lib/api";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { Invoice } from "@/types/domain";

export default async function CommissionsPage() {
  const locale = await getServerLocale();
  const dict = dictionaries[locale];
  const [employees, commissionResults, invoices] = await Promise.all([
    getEmployees(),
    getCommissionResults(),
    getInvoices(),
  ]);

  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  const employeeDepartment = (employeeId: string) =>
    employees.find((e) => e.id === employeeId)?.department ?? dict.common.notFound;

  const periods = Array.from(new Set(commissionResults.map((r) => r.period))).sort();
  const latestPeriod = periods.at(-1);
  const latestResults = commissionResults.filter((r) => r.period === latestPeriod);

  const totalPaidThisMonth = latestResults
    .filter((r) => r.status === "paid" || r.status === "approved")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const pendingInvoicesCount = invoices.filter((i) => i.status === "pending").length;

  const resultsWithRevenue = latestResults.filter((r) => r.revenue > 0);
  const averageCommissionRate = resultsWithRevenue.length
    ? (resultsWithRevenue.reduce((sum, r) => sum + r.commissionAmount / r.revenue, 0) / resultsWithRevenue.length) * 100
    : 0;

  const topFive = latestResults
    .slice()
    .sort((a, b) => b.commissionAmount - a.commissionAmount)
    .slice(0, 5)
    .map((r) => ({ name: employeeName(r.employeeId), commissionAmount: r.commissionAmount }));

  const byDepartment = new Map<string, number>();
  for (const result of latestResults) {
    const dept = employeeDepartment(result.employeeId);
    byDepartment.set(dept, (byDepartment.get(dept) ?? 0) + result.commissionAmount);
  }
  const departmentData = Array.from(byDepartment.entries())
    .filter(([, amount]) => amount > 0)
    .map(([department, commissionAmount]) => ({ department, commissionAmount }));

  const recentInvoices = invoices
    .slice()
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title={dict.commissions.title} />

      <div className="grid grid-cols-1 gap-4 px-8 md:grid-cols-3">
        <KpiCard
          label={dict.commissions.totalPaidThisMonth}
          value={formatCurrency(totalPaidThisMonth, locale)}
          badge={dict.common.positive}
        />
        <KpiCard label={dict.commissions.pendingInvoicesCount} value={String(pendingInvoicesCount)} />
        <KpiCard label={dict.commissions.averageCommissionRate} value={`${averageCommissionRate.toFixed(2)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 px-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">
            {dict.commissions.top5Title} {latestPeriod ? `(${formatPeriodLabel(latestPeriod, locale)})` : ""}
          </h2>
          <TopCommissionedBarChart data={topFive} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">{dict.commissions.distributionTitle}</h2>
          <DepartmentPieChart data={departmentData} />
        </div>
      </div>

      <div className="px-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">{dict.commissions.recentInvoices}</h2>
        <DataTable<Invoice>
          rowKey={(row) => row.id}
          data={recentInvoices}
          emptyMessage={dict.common.noRecords}
          columns={[
            { header: dict.commissions.invoiceId, cell: (row) => row.id },
            { header: dict.commissions.dueDate, cell: (row) => row.dueDate },
            { header: dict.commissions.employee, cell: (row) => employeeName(row.employeeId) },
            { header: dict.commissions.amount, cell: (row) => formatCurrency(row.amount, locale) },
            {
              header: dict.commissions.status,
              cell: (row) => <StatusBadge status={row.status} label={dict.status[row.status]} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
