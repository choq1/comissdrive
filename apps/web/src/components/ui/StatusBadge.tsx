const STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400",
  approved: "bg-cyan-500/10 text-cyan-300",
  pending: "bg-violet-500/10 text-violet-300",
  active: "bg-emerald-500/10 text-emerald-400",
  inactive: "bg-slate-500/10 text-slate-400",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = STYLES[status] ?? "bg-slate-500/10 text-slate-400";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>{label}</span>
  );
}
