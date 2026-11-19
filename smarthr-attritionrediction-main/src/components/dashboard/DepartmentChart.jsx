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
import { PieChart as PieIcon, BarChart3, Flame, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const GRADIENT_COLORS = [
  { id: "gradCoral", start: "hsl(var(--chart-coral))", end: "hsl(var(--chart-rose))" },
  { id: "gradBlue", start: "hsl(var(--chart-blue))", end: "hsl(var(--chart-indigo))" },
  { id: "gradTeal", start: "hsl(var(--chart-teal))", end: "hsl(var(--chart-emerald))" },
];

export function DepartmentChart({ barData }) {
  const [chartType, setChartType] = useState("pie"); // 'pie', 'bar', or 'heatmap'

  const getTitle = () => {
    if (chartType === "pie") return "Department Headcount Distribution";
    if (chartType === "bar") return "Attrition Risk by Department";
    return "Team Contagion Flight Risk Matrix";
  };

  return (
    <Card className="p-5 card-shadow h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            {getTitle()}
          </h3>
          {chartType === "heatmap" && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Identifies departmental flight risk clustering and turnover contagion
            </p>
          )}
        </div>
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
          <Button
            variant={chartType === "heatmap" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setChartType("heatmap")}
            title="View Contagion Heatmap"
          >
            <Flame className="h-4 w-4 text-rose-500" />
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

      {chartType === "heatmap" ? (
        <div className="flex-1 min-h-[250px] space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {barData.map((item, idx) => {
              const total = item.value || (item.Low + item.Medium + item.High) || 1;
              const highRate = Math.round(((item.High || 0) / total) * 100);
              const isCritical = highRate >= 25;
              const isElevated = highRate >= 12;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCritical
                      ? "bg-rose-950/20 border-rose-500/30"
                      : isElevated
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-emerald-950/20 border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.department || item.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{total} Active Headcount</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isCritical
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                          : isElevated
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isCritical ? "Cascading Risk" : isElevated ? "Elevated" : "Resilient"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-background/50 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Flight Hazard</span>
                      <span className={`font-bold ${isCritical ? "text-rose-400" : isElevated ? "text-amber-400" : "text-emerald-400"}`}>
                        {highRate}% ({item.High || 0} Critical)
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Turnover Loss</span>
                      <span className="font-bold text-foreground">
                        ${Math.round((item.High || 0) * 45000 / 1000)}k
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
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
      )}

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
