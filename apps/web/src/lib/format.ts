import { DEFAULT_LOCALE, Locale } from "./i18n/dictionaries";

export function formatCurrency(value: number, locale: Locale = DEFAULT_LOCALE): string {
  const intlLocale = locale === "pt-BR" ? "pt-BR" : "en-US";
  const currency = locale === "pt-BR" ? "BRL" : "USD";
  return new Intl.NumberFormat(intlLocale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatPeriodLabel(period: string, locale: Locale = DEFAULT_LOCALE): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const intlLocale = locale === "pt-BR" ? "pt-BR" : "en-US";
  return date.toLocaleDateString(intlLocale, { month: "short", year: "2-digit" });
}
