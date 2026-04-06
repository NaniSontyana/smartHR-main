import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GRADIENT_COLORS = [
  { id: "gradCoral", start: "hsl(var(--chart-coral))", end: "hsl(var(--chart-rose))" },
  { id: "gradBlue", start: "hsl(var(--chart-blue))", end: "hsl(var(--chart-indigo))" },
  { id: "gradTeal", start: "hsl(var(--chart-teal))", end: "hsl(var(--chart-emerald))" },
];

export function DepartmentChart({ barData }) {
  const [chartType, setChartType] = useState("pie"); // 'pie' or 'bar'

  return (
    <Card className="p-5 card-shadow h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          {chartType === "pie" ? "Department Distribution" : "Attrition Risk by Department"}
        </h3>
        <div className="flex bg-muted/50 p-1 rounded-lg gap-1">
          <Button
            variant={chartType === "pie" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setChartType("pie")}
            title="View as Pie Chart"
          >
            <PieIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setChartType("bar")}
            title="View as Bar Chart"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {chartType === "bar" && (
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">High Risk</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={barData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                   const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                   const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                   const total = barData.reduce((acc, curr) => acc + curr.value, 0);
                   const percentage = (value / total * 100).toFixed(0);
                   return (
                     <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600">
                       {`${percentage}%`}
                     </text>
                   );
                }}
                labelLine={false}
                strokeWidth={0}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]?.start || "#888"} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const total = barData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = (data.value / total * 100).toFixed(0);
                    return (
                      <div className="bg-card border rounded-xl shadow-lg p-2 text-sm text-foreground">
                        <p className="font-semibold mb-1">{data.name}</p>
                        <p className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                          {percentage}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          ) : (
            <BarChart data={barData} barGap={2} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="department"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: 'Employees', angle: -90, position: 'insideLeft', offset: -5, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Bar dataKey="Low" name="Low Risk" stackId="a" fill="#10b981" />
              <Bar dataKey="Medium" name="Medium Risk" stackId="a" fill="#f59e0b" />
              <Bar dataKey="High" name="High Risk" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Department Legend for Pie Chart */}
      {chartType === "pie" && (
        <div className="flex items-center justify-center gap-3 mt-4 text-xs flex-wrap">
          {barData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: GRADIENT_COLORS[index % GRADIENT_COLORS.length]?.start || "#888",
                }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default DepartmentChart;
