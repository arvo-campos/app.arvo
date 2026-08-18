"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function ChartByCliente({
  data,
}: {
  data: { cliente: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-arvo-grafite/50">
        Ainda não há manejos registrados.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1C1B1914" vertical={false} />
        <XAxis
          dataKey="cliente"
          tick={{ fontSize: 12, fill: "#1C1B19B3" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#1C1B19B3" }} />
        <Tooltip
          cursor={{ fill: "#C4501C0D" }}
          contentStyle={{
            borderRadius: 8,
            borderColor: "#1C1B191A",
            fontSize: 13,
          }}
        />
        <Bar dataKey="total" fill="#C4501C" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
