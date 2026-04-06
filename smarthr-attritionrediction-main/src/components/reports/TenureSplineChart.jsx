import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function TenureSplineChart({ title, data, nameKey, dataKey, subtitle }) {
  return (
    <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border card-shadow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTenure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={nameKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover text-popover-foreground rounded-lg border border-border shadow-md p-3">
                      <p className="font-medium text-sm mb-1 text-foreground">Tenure: {label} Years</p>
                      <p className="text-sm">Attrition: <span className="font-bold text-purple-500">{payload[0].value}%</span></p>
                      <p className="text-sm text-muted-foreground mt-1">Employees: {payload[0].payload.employees || payload[0].payload.total || 0}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--chart-purple))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTenure)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--chart-purple))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default TenureSplineChart;
