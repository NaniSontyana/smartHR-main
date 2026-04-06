import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function GradientAreaChart({ title, data, dataKeyX, dataKeyY = "attritionRate", subtitle }) {
  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-400" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-coral))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-coral))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={dataKeyX} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} dx={-10} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "12px 16px",
              }}
              labelStyle={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
              formatter={(value, name, props) => [`${value}%`, `Attrition Rate (${props.payload.total || props.payload.employees || 0} emp)`]}
            />
            <Area type="monotone" dataKey={dataKeyY} stroke="hsl(var(--chart-coral))" strokeWidth={3} fillOpacity={1} fill="url(#colorAttrition)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default GradientAreaChart;
