"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "pt-BR" ? "en" : "pt-BR")}
      className="flex items-center gap-1.5 self-start rounded-lg border border-slate-800 px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
      title={locale === "pt-BR" ? "Switch to English" : "Mudar para Português"}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="flex items-center gap-1">
        <span className={locale === "pt-BR" ? "text-cyan-300" : ""}>PT</span>
        <span className="text-slate-700">/</span>
        <span className={locale === "en" ? "text-cyan-300" : ""}>EN</span>
      </span>
    </button>
  );
}
