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
import { createSale, updateSale, deleteSale } from "@/lib/apiClient";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { Employee, Sale } from "@/types/domain";

interface SaleFormState {
  employeeId: string;
  date: string;
  store: string;
  itemDescription: string;
  itemSku: string;
  quantity: string;
  grossAmount: string;
  netAmount: string;
}

function saleToForm(employees: Employee[], sale?: Sale): SaleFormState {
  return {
    employeeId: sale?.employeeId ?? employees[0]?.id ?? "",
    date: sale?.date ?? "",
    store: sale?.store ?? "",
    itemDescription: sale?.itemDescription ?? "",
    itemSku: sale?.itemSku ?? "",
    quantity: sale?.quantity != null ? String(sale.quantity) : "1",
    grossAmount: sale?.grossAmount != null ? String(sale.grossAmount) : "",
    netAmount: sale?.netAmount != null ? String(sale.netAmount) : "",
  };
}

export function SalesTable({ sales, employees }: { sales: Sale[]; employees: Employee[] }) {
  const router = useRouter();
  const { locale, dict } = useLanguage();
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";
  const r = dict.revenue;

  const [search, setSearch] = useState("");
  const [store, setStore] = useState("all");
  const [formModal, setFormModal] = useState<{ sale?: Sale } | null>(null);
  const [saving, setSaving] = useState(false);

  const employeeName = (employeeId: string) => employees.find((e) => e.id === employeeId)?.name ?? employeeId;

  const stores = useMemo(() => Array.from(new Set(sales.map((s) => s.store))).sort(), [sales]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesSearch =
        !term ||
        (employees.find((e) => e.id === sale.employeeId)?.name ?? sale.employeeId).toLowerCase().includes(term) ||
        sale.itemDescription.toLowerCase().includes(term);
      const matchesStore = store === "all" || sale.store === store;
      return matchesSearch && matchesStore;
    });
  }, [sales, search, store, employees]);

  async function submitSale(form: SaleFormState, existing?: Sale) {
    setSaving(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        date: form.date,
        store: form.store,
        itemDescription: form.itemDescription,
        itemSku: form.itemSku || undefined,
        quantity: Number(form.quantity) || 1,
        grossAmount: Number(form.grossAmount) || 0,
        netAmount: Number(form.netAmount) || 0,
      };
      if (existing) {
        await updateSale(existing.id, payload);
      } else {
        await createSale(payload);
      }
      setFormModal(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeSale(id: string) {
    setSaving(true);
    try {
      await deleteSale(id);
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
            <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={r.employee}
              aria-label={r.employee}
              className="w-56 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="all">{r.filterByStore}</option>
            {stores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <Button variant="ghost" onClick={() => setFormModal({})}>
            <span className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> {r.addSale}
            </span>
          </Button>
        )}
      </div>

      <DataTable<Sale>
        rowKey={(row) => row.id}
        data={filtered}
        emptyMessage={r.empty}
        columns={[
          { header: r.employee, cell: (row) => employeeName(row.employeeId) },
          { header: r.date, cell: (row) => row.date },
          { header: r.store, cell: (row) => row.store },
          { header: r.itemDescription, cell: (row) => row.itemDescription },
          { header: r.grossAmount, cell: (row) => formatCurrency(row.grossAmount, locale) },
          { header: r.netAmount, cell: (row) => formatCurrency(row.netAmount, locale) },
          ...(isAdmin
            ? [
                {
                  header: "",
                  cell: (row: Sale) => (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFormModal({ sale: row })}
                        aria-label={r.editSaleTitle}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => removeSale(row.id)}
                        disabled={saving}
                        aria-label={r.deleteSaleAria}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      {formModal && (
        <SaleFormModal
          existing={formModal.sale}
          employees={employees}
          saving={saving}
          dict={dict}
          onClose={() => setFormModal(null)}
          onSubmit={(form) => submitSale(form, formModal.sale)}
        />
      )}
    </div>
  );
}

function SaleFormModal({
  existing,
  employees,
  saving,
  dict,
  onClose,
  onSubmit,
}: {
  existing?: Sale;
  employees: Employee[];
  saving: boolean;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (form: SaleFormState) => void;
}) {
  const [form, setForm] = useState<SaleFormState>(saleToForm(employees, existing));
  const r = dict.revenue;

  return (
    <Modal title={existing ? r.editSaleTitle : r.addSaleTitle} onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(evt) => {
          evt.preventDefault();
          onSubmit(form);
        }}
      >
        <Select
          label={r.employee}
          value={form.employeeId}
          onChange={(evt) => setForm({ ...form, employeeId: evt.target.value })}
          options={employees.map((e) => ({ value: e.id, label: e.name }))}
        />
        <Input
          label={r.date}
          type="date"
          required
          value={form.date}
          onChange={(evt) => setForm({ ...form, date: evt.target.value })}
        />
        <Input label={r.store} required value={form.store} onChange={(evt) => setForm({ ...form, store: evt.target.value })} />
        <Input
          label={r.itemDescription}
          required
          value={form.itemDescription}
          onChange={(evt) => setForm({ ...form, itemDescription: evt.target.value })}
        />
        <Input
          label={r.itemSku}
          value={form.itemSku}
          onChange={(evt) => setForm({ ...form, itemSku: evt.target.value })}
        />
        <Input
          label={r.quantity}
          type="number"
          min="1"
          required
          value={form.quantity}
          onChange={(evt) => setForm({ ...form, quantity: evt.target.value })}
        />
        <Input
          label={r.grossAmount}
          type="number"
          min="0"
          step="0.01"
          required
          value={form.grossAmount}
          onChange={(evt) => setForm({ ...form, grossAmount: evt.target.value })}
        />
        <Input
          label={r.netAmount}
          type="number"
          min="0"
          step="0.01"
          required
          value={form.netAmount}
          onChange={(evt) => setForm({ ...form, netAmount: evt.target.value })}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {existing ? dict.common.saveChanges : r.createSale}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
