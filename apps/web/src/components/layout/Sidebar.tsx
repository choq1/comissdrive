"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Users, DollarSign, FileText, Settings, LogOut } from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";
import { logout } from "@/lib/apiClient";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/commissions", label: "Commissions", icon: DollarSign },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  if (pathname === "/login") return null;

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-1 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold text-slate-50">
        <span className="text-cyan-400">~</span> Commissioning
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin").map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-slate-800/80 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-2 pt-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-200">{user.name}</div>
            <div className="truncate text-xs text-slate-500">{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
