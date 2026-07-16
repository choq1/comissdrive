"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/format";
import { Employee } from "@/types/domain";

export interface EmployeeRow extends Employee {
  currentCommission: number;
}

export function EmployeesTable({ employees }: { employees: EmployeeRow[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !term || employee.name.toLowerCase().includes(term) || employee.code.toLowerCase().includes(term);
      const matchesDepartment = department === "all" || employee.department === department;
      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, department]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-56 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none"
        >
          <option value="all">Filter By Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <DataTable<EmployeeRow>
        rowKey={(row) => row.id}
        data={filtered}
        columns={[
          {
            header: "Full Name",
            cell: (row) => (
              <div>
                <div className="font-medium text-slate-100">{row.name}</div>
                <div className="text-xs text-slate-500">{row.code}</div>
              </div>
            ),
          },
          { header: "Department", cell: (row) => row.department },
          {
            header: "Commission Tier",
            cell: (row) => (
              <span className={row.tier === "Gold" ? "text-amber-400" : "text-slate-300"}>{row.tier}</span>
            ),
          },
          { header: "Current Commission", cell: (row) => formatCurrency(row.currentCommission) },
          { header: "Status", cell: (row) => <span className="capitalize">{row.status}</span> },
        ]}
      />
    </div>
  );
}
