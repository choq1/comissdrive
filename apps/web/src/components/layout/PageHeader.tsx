"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Inbox, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/contexts/UserContext";
import { logout } from "@/lib/apiClient";
import { useDismissableMenu } from "@/lib/hooks/useDismissableMenu";
import { LanguageToggle } from "./LanguageToggle";

type OpenPanel = "inbox" | "notifications" | "account" | null;

export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const user = useCurrentUser();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  const inboxRef = useRef<HTMLDivElement>(null);
  const inboxTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountFirstItemRef = useRef<HTMLButtonElement>(null);

  useDismissableMenu(openPanel === "inbox", () => setOpenPanel(null), inboxRef, inboxTriggerRef);
  useDismissableMenu(openPanel === "notifications", () => setOpenPanel(null), notificationsRef, notificationsTriggerRef);
  useDismissableMenu(openPanel === "account", () => setOpenPanel(null), accountRef, accountTriggerRef, accountFirstItemRef);

  function togglePanel(panel: OpenPanel) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-8 pb-6 pt-8">
      <h1 className="text-2xl font-semibold text-slate-50">{title}</h1>

      <div className="flex items-center gap-3">
        <div ref={inboxRef} className="relative">
          <button
            ref={inboxTriggerRef}
            onClick={() => togglePanel("inbox")}
            aria-label={dict.pageHeader.inbox}
            aria-haspopup="dialog"
            aria-expanded={openPanel === "inbox"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
          </button>
          {openPanel === "inbox" && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
              <div className="border-b border-slate-800 px-3 py-2 text-sm font-medium text-slate-200">
                {dict.pageHeader.inbox}
              </div>
              <p className="px-3 py-6 text-center text-sm text-slate-400">{dict.pageHeader.inboxEmpty}</p>
            </div>
          )}
        </div>

        <div ref={notificationsRef} className="relative">
          <button
            ref={notificationsTriggerRef}
            onClick={() => togglePanel("notifications")}
            aria-label={dict.pageHeader.notifications}
            aria-haspopup="dialog"
            aria-expanded={openPanel === "notifications"}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
          </button>
          {openPanel === "notifications" && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
              <div className="border-b border-slate-800 px-3 py-2 text-sm font-medium text-slate-200">
                {dict.pageHeader.notifications}
              </div>
              <p className="px-3 py-6 text-center text-sm text-slate-400">{dict.pageHeader.notificationsEmpty}</p>
            </div>
          )}
        </div>

        <LanguageToggle />

        {user && (
          <div ref={accountRef} className="relative pl-1">
            <button
              ref={accountTriggerRef}
              onClick={() => togglePanel("account")}
              aria-label={dict.pageHeader.accountMenu}
              aria-haspopup="menu"
              aria-expanded={openPanel === "account"}
              className="flex items-center gap-2 rounded-lg py-1 pr-1 hover:bg-slate-900"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500" />
              <div className="text-left text-sm leading-tight">
                <div className="font-medium text-slate-100">{user.name}</div>
                <div className="text-xs text-slate-400">{user.role}</div>
              </div>
            </button>

            {openPanel === "account" && (
              <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
                <div className="border-b border-slate-800 px-3 py-2">
                  <div className="truncate text-sm font-medium text-slate-200">{user.name}</div>
                  <div className="truncate text-xs text-slate-400">{user.role}</div>
                </div>
                <button
                  ref={accountFirstItemRef}
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {dict.sidebar.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
