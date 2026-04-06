import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const GRADIENT_COLORS = [
  { start: "hsl(var(--chart-coral))", end: "hsl(var(--chart-rose))" },
  { start: "hsl(var(--chart-blue))", end: "hsl(var(--chart-indigo))" },
  { start: "hsl(var(--chart-teal))", end: "hsl(var(--chart-emerald))" },
  { start: "hsl(var(--chart-amber))", end: "hsl(var(--chart-orange))" },
  { start: "hsl(var(--chart-purple))", end: "hsl(var(--chart-pink))" },
];

export function EnhancedDonutChart({ title, data, nameKey, dataKey = "attritionRate", centerLabel }) {
  if (!data || data.length === 0) {
    return (
      <Card className="relative overflow-hidden p-6 card-shadow h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item[nameKey] || "Unknown",
    value: item[dataKey] || 0
  }));

  const totalAttrition = Math.round(chartData.reduce((sum, item) => {
    const headcount = item.total || item.employees || 0;
    const rate = (item.attritionRate || 0) / 100;
    return sum + (headcount * rate);
  }, 0));

  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {GRADIENT_COLORS.map((color, index) => (
                <linearGradient key={`grad-${index}`} id={`donutGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color.start} />
                  <stop offset="100%" stopColor={color.end} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#donutGrad${index % GRADIENT_COLORS.length})`} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "12px 16px" }}
              formatter={(value, name, props) => [`${value}%`, `${props.payload.name} (${props.payload.total || props.payload.employees || 0} emp)`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground">{isNaN(totalAttrition) ? 0 : totalAttrition}</span>
          <span className="text-sm text-muted-foreground">{centerLabel || "Total"}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartData.map((item, index) => {
          const colorStart = GRADIENT_COLORS[index % GRADIENT_COLORS.length]?.start || "#ccc";
          const colorEnd = GRADIENT_COLORS[index % GRADIENT_COLORS.length]?.end || "#999";
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})` }} />
              <span className="text-sm text-muted-foreground">{item.name} <span className="font-semibold text-foreground">{item[dataKey] || 0}%</span></span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default EnhancedDonutChart;

