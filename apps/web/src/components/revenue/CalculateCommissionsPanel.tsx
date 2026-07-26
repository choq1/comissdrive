"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calculateCommissions } from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";

export function CalculateCommissionsPanel({ defaultPeriod }: { defaultPeriod?: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const r = dict.revenue;

  const [period, setPeriod] = useState(defaultPeriod ?? "");
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCalculate() {
    if (!period) return;
    setCalculating(true);
    setMessage(null);
    try {
      const results = await calculateCommissions(period);
      setMessage(`${r.calculateSuccess} (${results.length})`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setCalculating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-sm font-medium text-slate-300">{r.calculateCommissionsTitle}</h2>
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label={r.period}
          placeholder="YYYY-MM"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
        <Button onClick={handleCalculate} disabled={!period || calculating}>
          {calculating ? r.calculating : r.calculate}
        </Button>
      </div>
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
}
