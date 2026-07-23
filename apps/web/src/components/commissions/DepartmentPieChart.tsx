"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";

interface PieSlice {
  department: string;
  commissionAmount: number;
}

const COLORS = ["#22d3ee", "#6366f1", "#a855f7", "#f472b6", "#34d399"];

export function DepartmentPieChart({ data }: { data: PieSlice[] }) {
  const { locale, dict } = useLanguage();

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="commissionAmount" nameKey="department" innerRadius={60} outerRadius={90} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.department} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value: number) => [formatCurrency(value, locale), dict.charts.commissionLabel]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
