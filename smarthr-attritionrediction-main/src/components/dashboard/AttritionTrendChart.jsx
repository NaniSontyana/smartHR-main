import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useMemo } from "react";
// ... imports

export function AttritionTrendChart({ data, period, onPeriodChange }) {
  const peakData = useMemo(() => {
    return data && data.length > 0
      ? data.reduce((max, current) => (current.value > max.value ? current : max), data[0])
      : { value: 0, month: "-" };
  }, [data]);

  return (
    <Card className="p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Attrition Trend</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {peakData.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {data && data.length > 0 ? `Peak in ${peakData.month}` : "No data available"}
            </span>
          </div>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-coral))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-coral))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              formatter={(value) => [`${value}%`, "Attrition"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-coral))"
              strokeWidth={3}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default AttritionTrendChart;
