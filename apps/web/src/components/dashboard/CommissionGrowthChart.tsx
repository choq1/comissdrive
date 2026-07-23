"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";

interface GrowthPoint {
  period: string;
  label: string;
  total: number;
}

export function CommissionGrowthChart({ data }: { data: GrowthPoint[] }) {
  const { locale, dict } = useLanguage();

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="commissionGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(v) => formatCurrency(Number(v), locale)}
          />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value: number) => [formatCurrency(value, locale), dict.charts.commissionLabel]}
          />
          <Area type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2} fill="url(#commissionGrowth)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
