"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";

interface BarPoint {
  name: string;
  commissionAmount: number;
}

export function TopCommissionedBarChart({ data }: { data: BarPoint[] }) {
  const { locale, dict } = useLanguage();

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(Number(v), locale)}
          />
          <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value: number) => [formatCurrency(value, locale), dict.charts.commissionLabel]}
          />
          <Bar dataKey="commissionAmount" fill="#6366f1" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
