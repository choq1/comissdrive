"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createRule, updateRule, deleteRule, createTier, updateTier, deleteTier } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { CommissionRule, CommissionRuleScope, CommissionRuleType, CommissionTier } from "@/types/domain";

interface RuleFormState {
  name: string;
  type: CommissionRuleType;
  scope: CommissionRuleScope;
  appliesTo: string;
  percentage: string;
  threshold: string;
}

function ruleToForm(rule?: CommissionRule): RuleFormState {
  return {
    name: rule?.name ?? "",
    type: rule?.type ?? "base",
    scope: rule?.scope ?? "department",
    appliesTo: rule?.appliesTo ?? "",
    percentage: rule?.percentage != null ? String(rule.percentage) : "",
    threshold: rule?.threshold != null ? String(rule.threshold) : "",
  };
}

interface TierFormState {
  tierName: string;
  minRevenue: string;
  maxRevenue: string;
  percentage: string;
}

function tierToForm(tier?: CommissionTier): TierFormState {
  return {
    tierName: tier?.tierName ?? "",
    minRevenue: tier?.minRevenue != null ? String(tier.minRevenue) : "",
    maxRevenue: tier?.maxRevenue != null ? String(tier.maxRevenue) : "",
    percentage: tier?.percentage != null ? String(tier.percentage) : "",
  };
}

export function RulesEditor({ rules, tiers }: { rules: CommissionRule[]; tiers: CommissionTier[] }) {
  const router = useRouter();
  const { locale, dict } = useLanguage();
  const [ruleModal, setRuleModal] = useState<{ rule?: CommissionRule } | null>(null);
  const [tierModal, setTierModal] = useState<{ ruleId: string; tier?: CommissionTier } | null>(null);
  const [saving, setSaving] = useState(false);

  const typeLabels: Record<CommissionRuleType, string> = {
    base: dict.settings.rules.typeBase,
    volumeBonus: dict.settings.rules.typeVolumeBonus,
    tiered: dict.settings.rules.typeTiered,
  };

  async function submitRule(form: RuleFormState, existing?: CommissionRule) {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        scope: form.scope,
        appliesTo: form.scope === "global" ? null : form.appliesTo || null,
        percentage: Number(form.percentage) || 0,
        threshold: form.threshold ? Number(form.threshold) : null,
      };
      if (existing) {
        await updateRule(existing.id, payload);
      } else {
        await createRule(payload);
      }
      setRuleModal(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeRule(id: string) {
    setSaving(true);
    try {
      await deleteRule(id);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function submitTier(form: TierFormState, ruleId: string, existing?: CommissionTier) {
    setSaving(true);
    try {
      const payload = {
        ruleId,
        tierName: form.tierName,
        minRevenue: Number(form.minRevenue) || 0,
        maxRevenue: form.maxRevenue ? Number(form.maxRevenue) : null,
        percentage: Number(form.percentage) || 0,
      };
      if (existing) {
        await updateTier(existing.id, payload);
      } else {
        await createTier(payload);
      }
      setTierModal(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeTier(id: string) {
    setSaving(true);
    try {
      await deleteTier(id);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">{dict.settings.rules.heading}</h2>
        <Button variant="ghost" onClick={() => setRuleModal({})}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> {dict.settings.rules.addNewRule}
          </span>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {rules.length === 0 && <p className="text-sm text-slate-500">{dict.settings.rules.empty}</p>}

        {rules.map((rule) => (
          <div key={rule.id} className="rounded-lg border border-slate-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-cyan-400">
                  {typeLabels[rule.type]}
                </span>
                <p className="text-sm font-medium text-slate-100">{rule.name}</p>
                <p className="text-xs text-slate-500">
                  {rule.scope === "global" ? dict.settings.rules.appliesGlobally : `${rule.scope}: ${rule.appliesTo}`} ·{" "}
                  {rule.percentage}%
                  {rule.threshold != null && ` ${dict.settings.rules.above} ${formatCurrency(rule.threshold, locale)}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setRuleModal({ rule })}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeRule(rule.id)}
                  disabled={saving}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {rule.type === "tiered" && (
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-3">
                {tiers
                  .filter((tier) => tier.ruleId === rule.id)
                  .map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm">
                      <span className="text-slate-300">
                        {tier.tierName}: {formatCurrency(tier.minRevenue, locale)} –{" "}
                        {tier.maxRevenue != null ? formatCurrency(tier.maxRevenue, locale) : "∞"} → {tier.percentage}%
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTierModal({ ruleId: rule.id, tier })}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeTier(tier.id)}
                          disabled={saving}
                          className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                <button
                  onClick={() => setTierModal({ ruleId: rule.id })}
                  className="self-start text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  {dict.settings.rules.addTier}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {ruleModal && (
        <RuleFormModal
          existing={ruleModal.rule}
          saving={saving}
          dict={dict}
          onClose={() => setRuleModal(null)}
          onSubmit={(form) => submitRule(form, ruleModal.rule)}
        />
      )}

      {tierModal && (
        <TierFormModal
          existing={tierModal.tier}
          saving={saving}
          dict={dict}
          onClose={() => setTierModal(null)}
          onSubmit={(form) => submitTier(form, tierModal.ruleId, tierModal.tier)}
        />
      )}
    </div>
  );
}

function RuleFormModal({
  existing,
  saving,
  dict,
  onClose,
  onSubmit,
}: {
  existing?: CommissionRule;
  saving: boolean;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (form: RuleFormState) => void;
}) {
  const [form, setForm] = useState<RuleFormState>(ruleToForm(existing));
  const r = dict.settings.rules;

  return (
    <Modal title={existing ? r.editRuleTitle : r.addRuleTitle} onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input
          label={r.name}
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Select
          label={r.type}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as CommissionRuleType })}
          options={[
            { value: "base", label: r.typeBase },
            { value: "volumeBonus", label: r.typeVolumeBonus },
            { value: "tiered", label: r.typeTiered },
          ]}
        />
        <Select
          label={r.scope}
          value={form.scope}
          onChange={(e) => setForm({ ...form, scope: e.target.value as CommissionRuleScope })}
          options={[
            { value: "department", label: r.department },
            { value: "role", label: r.role },
            { value: "global", label: r.global },
          ]}
        />
        {form.scope !== "global" && (
          <Input
            label={form.scope === "department" ? r.department : r.role}
            required
            value={form.appliesTo}
            onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
          />
        )}
        <Input
          label={r.percentage}
          type="number"
          step="0.1"
          min="0"
          required
          value={form.percentage}
          onChange={(e) => setForm({ ...form, percentage: e.target.value })}
        />
        {form.type === "volumeBonus" && (
          <Input
            label={r.threshold}
            type="number"
            min="0"
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })}
          />
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {existing ? r.saveChanges : r.createRule}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TierFormModal({
  existing,
  saving,
  dict,
  onClose,
  onSubmit,
}: {
  existing?: CommissionTier;
  saving: boolean;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (form: TierFormState) => void;
}) {
  const [form, setForm] = useState<TierFormState>(tierToForm(existing));
  const r = dict.settings.rules;

  return (
    <Modal title={existing ? r.editTierTitle : r.addTierTitleModal} onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <Input
          label={r.tierName}
          required
          value={form.tierName}
          onChange={(e) => setForm({ ...form, tierName: e.target.value })}
        />
        <Input
          label={r.minRevenue}
          type="number"
          min="0"
          required
          value={form.minRevenue}
          onChange={(e) => setForm({ ...form, minRevenue: e.target.value })}
        />
        <Input
          label={r.maxRevenue}
          type="number"
          min="0"
          value={form.maxRevenue}
          onChange={(e) => setForm({ ...form, maxRevenue: e.target.value })}
        />
        <Input
          label={r.percentage}
          type="number"
          step="0.1"
          min="0"
          required
          value={form.percentage}
          onChange={(e) => setForm({ ...form, percentage: e.target.value })}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {existing ? r.saveChanges : r.addTierBtn}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
