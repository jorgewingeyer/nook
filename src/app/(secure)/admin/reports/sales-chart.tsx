"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { getOrderStatusConfig } from "@/lib/order-utils";
import type { DailySale, OrdersByStatus } from "./reports.action";

const CHART_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}`;
}

export function SalesBarChart({ data }: { data: DailySale[] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={45}
        />
        <Tooltip
          formatter={(value) => [typeof value === "number" ? formatCurrency(value) : value, "Ventas"]}
          labelFormatter={(label) => {
            if (typeof label !== "string") return label;
            const [y, m, d] = label.split("-");
            return `${parseInt(d)}/${parseInt(m)}/${y}`;
          }}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#0ea5e9" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: OrdersByStatus[] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos para el período seleccionado
      </div>
    );
  }

  const enriched = data.map((d, i) => ({
    ...d,
    label: getOrderStatusConfig(d.status).label,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={enriched}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {enriched.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [v, "Pedidos"]} contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-1.5 self-center text-sm">
        {enriched.map((entry) => (
          <li key={entry.status} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: entry.fill }}
            />
            <span className="text-muted-foreground">{entry.label}</span>
            <span className="ml-auto font-medium tabular-nums">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
