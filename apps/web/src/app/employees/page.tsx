import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeesTable, EmployeeRow } from "@/components/employees/EmployeesTable";
import { getCommissionResults, getEmployees } from "@/lib/api";

export default async function EmployeesPage() {
  const [employees, commissionResults] = await Promise.all([getEmployees(), getCommissionResults()]);

  const periods = Array.from(new Set(commissionResults.map((r) => r.period))).sort();
  const latestPeriod = periods.at(-1);

  const rows: EmployeeRow[] = employees.map((employee) => {
    const result = commissionResults.find((r) => r.employeeId === employee.id && r.period === latestPeriod);
    return { ...employee, currentCommission: result?.commissionAmount ?? 0 };
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Employee Management" />
      <div className="px-8">
        <EmployeesTable employees={rows} />
      </div>
    </div>
  );
}
