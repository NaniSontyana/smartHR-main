import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "from-rose-500 to-pink-400",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-orange-400",
  "from-indigo-500 to-blue-400",
  "from-pink-500 to-rose-400",
  "from-cyan-500 to-teal-400",
  "from-orange-500 to-amber-400",
];

export function HorizontalBarChart({ title, data, nameKey, valueKey = "value", maxValue = 50 }) {
  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item[valueKey] / maxValue) * 100;
          const isHighRisk = item[valueKey] > 30;
          const isMediumRisk = item[valueKey] > 20;
          return (
            <div key={item[nameKey]} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground truncate max-w-[55%]">{item[nameKey]}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{item.total || item.employees || 0} employees</span>
                  <span className={`text-base font-bold min-w-[45px] text-right ${isHighRisk ? 'text-rose-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {item[valueKey]}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${COLORS[index % COLORS.length]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default HorizontalBarChart;
