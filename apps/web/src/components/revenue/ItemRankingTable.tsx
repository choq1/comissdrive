"use client";

import { DataTable } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { ItemRankingRow } from "@/types/domain";

export function ItemRankingTable({ ranking }: { ranking: ItemRankingRow[] }) {
  const { locale, dict } = useLanguage();
  const r = dict.revenue;

  return (
    <DataTable<ItemRankingRow>
      rowKey={(row) => row.itemDescription}
      data={ranking}
      emptyMessage={r.empty}
      columns={[
        { header: r.rankingItem, cell: (row) => row.itemDescription },
        { header: r.rankingQuantity, cell: (row) => String(row.totalQuantity) },
        { header: r.rankingNet, cell: (row) => formatCurrency(row.totalNet, locale) },
      ]}
    />
  );
}
