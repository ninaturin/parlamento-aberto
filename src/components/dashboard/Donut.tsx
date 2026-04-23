import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatBRL } from "@/lib/emendas/format";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.45 0.09 280)",
  "oklch(0.65 0.13 30)",
  "oklch(0.55 0.1 160)",
];

type Datum = { name: string; value: number };

export function Donut({ data, height = 260 }: { data: Datum[]; height?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, name) => [
            `${formatBRL(v)} (${((v / total) * 100).toFixed(1)}%)`,
            name as string,
          ]}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
