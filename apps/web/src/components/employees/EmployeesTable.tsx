"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/contexts/UserContext";
import { createEmployee, updateEmployee, deleteEmployee } from "@/lib/apiClient";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { CommissionTierLevel, Employee, EmployeeStatus } from "@/types/domain";

export interface EmployeeRow extends Employee {
  currentCommission: number;
}

interface EmployeeFormState {
  code: string;
  name: string;
  role: string;
  department: string;
  baseSalary: string;
  tier: CommissionTierLevel;
  status: EmployeeStatus;
}

function employeeToForm(employee?: Employee): EmployeeFormState {
  return {
    code: employee?.code ?? "",
    name: employee?.name ?? "",
    role: employee?.role ?? "",
    department: employee?.department ?? "",
    baseSalary: employee?.baseSalary != null ? String(employee.baseSalary) : "",
    tier: employee?.tier ?? "Silver",
    status: employee?.status ?? "active",
  };
}

export function EmployeesTable({ employees }: { employees: EmployeeRow[] }) {
  const router = useRouter();
  const { locale, dict } = useLanguage();
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [formModal, setFormModal] = useState<{ employee?: Employee } | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function submitEmployee(form: EmployeeFormState, existing?: Employee) {
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        name: form.name,
        role: form.role,
        department: form.department,
        baseSalary: Number(form.baseSalary) || 0,
        tier: form.tier,
        status: form.status,
      };
      if (existing) {
        await updateEmployee(existing.id, payload);
      } else {
        await createEmployee(payload);
      }
      setFormModal(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(id: string) {
    setSaving(true);
    try {
      await deleteEmployee(id);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.employees.search}
              className="w-56 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="all">{dict.employees.filterByDepartment}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <Button variant="ghost" onClick={() => setFormModal({})}>
            <span className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> {dict.employees.addEmployee}
            </span>
          </Button>
        )}
      </div>

      <DataTable<EmployeeRow>
        rowKey={(row) => row.id}
        data={filtered}
        emptyMessage={dict.employees.empty}
        columns={[
          {
            header: dict.employees.fullName,
            cell: (row) => (
              <div>
                <div className="font-medium text-slate-100">{row.name}</div>
                <div className="text-xs text-slate-500">{row.code}</div>
              </div>
            ),
          },
          { header: dict.employees.department, cell: (row) => row.department },
          {
            header: dict.employees.commissionTier,
            cell: (row) => (
              <span className={row.tier === "Gold" ? "text-amber-400" : "text-slate-300"}>{row.tier}</span>
            ),
          },
          { header: dict.employees.currentCommission, cell: (row) => formatCurrency(row.currentCommission, locale) },
          {
            header: dict.employees.status,
            cell: (row) => <span className="capitalize">{dict.status[row.status]}</span>,
          },
          ...(isAdmin
            ? [
                {
                  header: "",
                  cell: (row: EmployeeRow) => (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFormModal({ employee: row })}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeEmployee(row.id)}
                        disabled={saving}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      {formModal && (
        <EmployeeFormModal
          existing={formModal.employee}
          saving={saving}
          dict={dict}
          onClose={() => setFormModal(null)}
          onSubmit={(form) => submitEmployee(form, formModal.employee)}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({
  existing,
  saving,
  dict,
  onClose,
  onSubmit,
}: {
  existing?: Employee;
  saving: boolean;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (form: EmployeeFormState) => void;
}) {
  const [form, setForm] = useState<EmployeeFormState>(employeeToForm(existing));
  const e = dict.employees;

  return (
    <Modal title={existing ? e.editEmployeeTitle : e.addEmployeeTitle} onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(evt) => {
          evt.preventDefault();
          onSubmit(form);
        }}
      >
        <Input label={e.code} required value={form.code} onChange={(evt) => setForm({ ...form, code: evt.target.value })} />
        <Input label={e.fullName} required value={form.name} onChange={(evt) => setForm({ ...form, name: evt.target.value })} />
        <Input label={e.role} required value={form.role} onChange={(evt) => setForm({ ...form, role: evt.target.value })} />
        <Input
          label={e.department}
          required
          value={form.department}
          onChange={(evt) => setForm({ ...form, department: evt.target.value })}
        />
        <Input
          label={e.baseSalary}
          type="number"
          min="0"
          required
          value={form.baseSalary}
          onChange={(evt) => setForm({ ...form, baseSalary: evt.target.value })}
        />
        <Select
          label={e.tier}
          value={form.tier}
          onChange={(evt) => setForm({ ...form, tier: evt.target.value as CommissionTierLevel })}
          options={[
            { value: "Gold", label: e.tierGold },
            { value: "Silver", label: e.tierSilver },
          ]}
        />
        <Select
          label={e.status}
          value={form.status}
          onChange={(evt) => setForm({ ...form, status: evt.target.value as EmployeeStatus })}
          options={[
            { value: "active", label: dict.status.active },
            { value: "inactive", label: dict.status.inactive },
          ]}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {existing ? dict.common.saveChanges : e.createEmployee}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
