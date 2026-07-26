import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { SalesTable } from "@/components/revenue/SalesTable";
import { ItemRankingTable } from "@/components/revenue/ItemRankingTable";
import { CalculateCommissionsPanel } from "@/components/revenue/CalculateCommissionsPanel";
import { BulkImportPanel } from "@/components/revenue/BulkImportPanel";
import { getEmployees, getItemRanking, getSales } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export default async function RevenuePage() {
  const locale = await getServerLocale();
  const dict = dictionaries[locale];
  const [user, sales, employees] = await Promise.all([getCurrentUser(), getSales(), getEmployees()]);

  const periods = Array.from(new Set(sales.map((s) => s.period))).sort();
  const latestPeriod = periods.at(-1);
  const latestSales = sales.filter((s) => s.period === latestPeriod);

  const totalNet = latestSales.reduce((sum, s) => sum + s.netAmount, 0);
  const totalGross = latestSales.reduce((sum, s) => sum + s.grossAmount, 0);
  const averageTicket = latestSales.length ? totalNet / latestSales.length : 0;

  const ranking = latestPeriod ? await getItemRanking({ period: latestPeriod }) : [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title={dict.revenue.title} />

      <div className="grid grid-cols-1 gap-4 px-8 md:grid-cols-3">
        <KpiCard
          label={dict.revenue.totalNet}
          value={formatCurrency(totalNet, locale)}
          hint={latestPeriod ? formatPeriodLabel(latestPeriod, locale) : undefined}
        />
        <KpiCard label={dict.revenue.totalGross} value={formatCurrency(totalGross, locale)} />
        <KpiCard label={dict.revenue.averageTicket} value={formatCurrency(averageTicket, locale)} />
      </div>

      {user?.role === "admin" && (
        <div className="grid grid-cols-1 gap-4 px-8 lg:grid-cols-2">
          <CalculateCommissionsPanel defaultPeriod={latestPeriod} />
          <BulkImportPanel />
        </div>
      )}

      <div className="px-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">{dict.revenue.salesTable}</h2>
        <SalesTable sales={sales} employees={employees} />
      </div>

      <div className="px-8">
        <h2 className="mb-3 text-sm font-medium text-slate-300">{dict.revenue.rankingTitle}</h2>
        <ItemRankingTable ranking={ranking} />
      </div>
    </div>
  );
}
