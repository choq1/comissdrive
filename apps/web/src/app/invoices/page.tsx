import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getEmployees, getInvoices } from "@/lib/api";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { Invoice } from "@/types/domain";

export default async function InvoicesPage() {
  const locale = await getServerLocale();
  const dict = dictionaries[locale];
  const [employees, invoices] = await Promise.all([getEmployees(), getInvoices()]);
  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;

  const sorted = invoices.slice().sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title={dict.invoices.title} />
      <div className="px-8">
        <DataTable<Invoice>
          rowKey={(row) => row.id}
          data={sorted}
          emptyMessage={dict.common.noRecords}
          columns={[
            { header: dict.invoices.invoiceId, cell: (row) => row.id },
            { header: dict.invoices.employee, cell: (row) => employeeName(row.employeeId) },
            { header: dict.invoices.period, cell: (row) => formatPeriodLabel(row.period, locale) },
            { header: dict.invoices.dueDate, cell: (row) => row.dueDate },
            { header: dict.invoices.amount, cell: (row) => formatCurrency(row.amount, locale) },
            {
              header: dict.invoices.status,
              cell: (row) => <StatusBadge status={row.status} label={dict.status[row.status]} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
