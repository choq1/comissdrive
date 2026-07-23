import { formatCurrency } from "@/lib/format";
import { Dictionary, Locale } from "@/lib/i18n/dictionaries";

interface TopPerformer {
  employeeId: string;
  name: string;
  commissionAmount: number;
}

export function TopPerformers({
  performers,
  dict,
  locale,
}: {
  performers: TopPerformer[];
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-sm font-medium text-slate-300">{dict.dashboard.topPerformers}</h2>
      <ul className="flex flex-col gap-4">
        {performers.length === 0 && <li className="text-sm text-slate-500">{dict.dashboard.noDataForPeriod}</li>}
        {performers.map((performer, index) => (
          <li key={performer.employeeId} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-xs font-semibold text-slate-950">
                {index + 1}
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-100">{performer.name}</div>
                <div className="text-xs text-slate-500">{dict.pageHeader.fictionalData}</div>
              </div>
            </div>
            <span className="text-sm font-medium text-slate-200">
              {formatCurrency(performer.commissionAmount, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
