"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createUser, deleteUser, updateUser } from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { Employee, User, UserRole } from "@/types/domain";

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  password: string;
}

export function UserPermissionsPanel({ users, employees }: { users: User[]; employees: Employee[] }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const roleOptions = [
    { value: "admin", label: dict.settings.users.admin },
    { value: "manager", label: dict.settings.users.manager },
  ];

  async function changeRole(user: User, role: UserRole) {
    setSaving(true);
    try {
      await updateUser(user.id, { role });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(id: string) {
    setSaving(true);
    try {
      await deleteUser(id);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function submitNewUser(form: UserFormState) {
    setSaving(true);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        role: form.role,
        employeeId: form.employeeId || undefined,
        password: form.password,
      });
      setCreating(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">{dict.settings.users.heading}</h2>
        <Button variant="ghost" onClick={() => setCreating(true)}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> {dict.settings.users.addUser}
          </span>
        </Button>
      </div>

      <DataTable<User>
        rowKey={(row) => row.id}
        data={users}
        emptyMessage={dict.settings.users.empty}
        columns={[
          {
            header: dict.settings.users.name,
            cell: (row) => (
              <div>
                <div className="font-medium text-slate-100">{row.name}</div>
                <div className="text-xs text-slate-500">{row.email}</div>
              </div>
            ),
          },
          {
            header: dict.settings.users.role,
            cell: (row) => (
              <Select
                value={row.role}
                disabled={saving}
                onChange={(e) => changeRole(row, e.target.value as UserRole)}
                options={roleOptions}
                className="py-1.5"
              />
            ),
          },
          {
            header: "",
            cell: (row) => (
              <button
                onClick={() => removeUser(row.id)}
                disabled={saving}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ),
          },
        ]}
      />

      {creating && (
        <UserFormModal
          employees={employees}
          saving={saving}
          dict={dict}
          roleOptions={roleOptions}
          onClose={() => setCreating(false)}
          onSubmit={submitNewUser}
        />
      )}
    </div>
  );
}

function UserFormModal({
  employees,
  saving,
  dict,
  roleOptions,
  onClose,
  onSubmit,
}: {
  employees: Employee[];
  saving: boolean;
  dict: Dictionary;
  roleOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (form: UserFormState) => void;
}) {
  const [form, setForm] = useState<UserFormState>({
    name: "",
    email: "",
    role: "manager",
    employeeId: "",
    password: "",
  });
  const u = dict.settings.users;

  return (
    <Modal title={u.addUserTitle} onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input label={u.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input
          label={u.email}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={u.password}
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Select
          label={u.role}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          options={roleOptions}
        />
        <Select
          label={u.linkedEmployee}
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          options={[{ value: "", label: u.none }, ...employees.map((emp) => ({ value: emp.id, label: emp.name }))]}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {u.addUserBtn}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
