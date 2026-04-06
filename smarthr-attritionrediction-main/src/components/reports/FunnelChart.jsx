import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function FunnelChart({ title, data, nameKey, dataKey = "attritionRate", subtitle }) {
  const maxRate = Math.max(...data.map((d) => d[dataKey] || 0));

  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
          const val = item[dataKey] || 0;
          const widthPercent = maxRate > 0 ? 35 + ((val / maxRate) * 65) : 35;
          return (
            <div key={item[nameKey]} className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground text-right shrink-0 truncate" title={item[nameKey]}>
                {item[nameKey]}
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="h-10 rounded-r-full flex items-center justify-end px-4 transition-all duration-500 shadow-sm hover:shadow-md"
                  style={{
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}90, ${COLORS[index % COLORS.length]})`,
                  }}
                >
                  <span className="text-sm font-bold text-white drop-shadow-sm">{val}%</span>
                </div>
                <span className="text-sm text-muted-foreground shrink-0 min-w-[60px]">{item.total || item.employees || 0} emp</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default FunnelChart;
