import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  badge?: string;
  hint?: string;
  children?: ReactNode;
}

export function KpiCard({ label, value, badge, hint, children }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        {badge && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            {badge}
          </span>
        )}
      </div>
      <span className="text-2xl font-semibold text-slate-50">{value}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
      {children}
    </div>
  );
}
