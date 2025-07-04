// RevenueExpenseChart.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

// 💰 Dados de exemplo
const data = [
  { name: "Janeiro", Receita: 12000, Despesa: 8000 },
  { name: "Fevereiro", Receita: 15000, Despesa: 9500 },
  { name: "Março", Receita: 10000, Despesa: 7000 },
];

export default function RevenueExpenseChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) =>
              [`R$ ${value.toFixed(2)}`, name === "Receita" ? "Receita" : "Despesa"]
            }
          />
          <Bar
            dataKey="Receita"
            fill="#16A34A"
            animationDuration={800}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="Receita"
              position="top"
              formatter={(v) => `R$ ${v}`}
            />
          </Bar>
          <Bar
            dataKey="Despesa"
            fill="#DC2626"
            animationDuration={800}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="Despesa"
              position="top"
              formatter={(v) => `R$ ${v}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
