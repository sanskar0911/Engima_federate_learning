"use client";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function RiskChart({ data }: { data: any }) {
  return (
    <PieChart width={300} height={300}>
      <Pie data={data} dataKey="value" outerRadius={100}>
        {data.map((_: any, index: number) => (
          <Cell key={index} fill={["#ff4d4f", "#faad14", "#52c41a"][index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}