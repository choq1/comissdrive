import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getEmployees, getInvoices } from "@/lib/api";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";
import { Invoice } from "@/types/domain";

export default async function InvoicesPage() {
  const [employees, invoices] = await Promise.all([getEmployees(), getInvoices()]);
  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;

  const sorted = invoices.slice().sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Invoices" />
      <div className="px-8">
        <DataTable<Invoice>
          rowKey={(row) => row.id}
          data={sorted}
          columns={[
            { header: "Invoice ID", cell: (row) => row.id },
            { header: "Employee", cell: (row) => employeeName(row.employeeId) },
            { header: "Period", cell: (row) => formatPeriodLabel(row.period) },
            { header: "Due Date", cell: (row) => row.dueDate },
            { header: "Amount", cell: (row) => formatCurrency(row.amount) },
            { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
