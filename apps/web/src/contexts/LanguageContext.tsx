"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, Dictionary, Locale } from "@/lib/i18n/dictionaries";

interface LanguageContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(newLocale: Locale) {
    if (newLocale === locale) return;
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    setLocaleState(newLocale);
    router.refresh();
  }

  return (
    <LanguageContext.Provider value={{ locale, dict: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
