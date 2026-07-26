"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, TrendingUp, DollarSign, FileText, Settings } from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLogo } from "@/components/layout/BrandLogo";

const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutGrid },
  { href: "/employees", key: "employees" as const, icon: Users },
  { href: "/revenue", key: "revenue" as const, icon: TrendingUp },
  { href: "/commissions", key: "commissions" as const, icon: DollarSign },
  { href: "/invoices", key: "invoices" as const, icon: FileText },
  { href: "/settings", key: "settings" as const, icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const { dict } = useLanguage();

  if (pathname === "/login") return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-1 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 px-2">
        <BrandLogo size="small" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin").map(({ href, key, icon: Icon }) => {
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
              {dict.sidebar[key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
