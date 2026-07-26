"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { formatPeriodLabel } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";

export function PeriodSelect({ periods, selected }: { periods: string[]; selected?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, dict } = useLanguage();

  function handleChange(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      label={dict.commissions.periodLabel}
      options={periods.map((period) => ({ value: period, label: formatPeriodLabel(period, locale) }))}
      value={selected ?? ""}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
