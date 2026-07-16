import { Bell, Inbox } from "lucide-react";

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-8 pb-6 pt-8">
      <h1 className="text-2xl font-semibold text-slate-50">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <Inbox className="h-4 w-4" />
        </button>
        <button className="relative rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400" />
        </button>
        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500" />
          <div className="text-sm leading-tight">
            <div className="font-medium text-slate-100">Admin</div>
            <div className="text-xs text-slate-500">Fictional data</div>
          </div>
        </div>
      </div>
    </header>
  );
}
