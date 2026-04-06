import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const COLORS = [
  "hsl(var(--chart-coral))",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-amber))",
  "hsl(var(--chart-teal))",
  "hsl(var(--chart-emerald))",
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-indigo))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-pink))",
];

export function JobRoleBarChart({ title, data, nameKey, dataKey, subtitle }) {
  // Sort data descending by attritionRate for best visual impact
  const sortedData = [...data].sort((a, b) => b[dataKey] - a[dataKey]);

  return (
    <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border card-shadow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey={nameKey} 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
              width={120}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted)/0.5)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover text-popover-foreground rounded-lg border border-border shadow-md p-3">
                      <p className="font-medium text-sm mb-1 text-foreground">{payload[0].payload[nameKey]}</p>
                      <p className="text-sm">Attrition: <span className="font-bold text-red-500">{payload[0].value}%</span></p>
                      <p className="text-sm text-muted-foreground mt-1">Employees: {payload[0].payload.employees || payload[0].payload.total || 0}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={20}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default JobRoleBarChart;
