import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARD_COLORS = [
  { accent: "text-rose-500", border: "border-border", iconBg: "bg-rose-500/10" },
  { accent: "text-amber-500", border: "border-border", iconBg: "bg-amber-500/10" },
  { accent: "text-emerald-500", border: "border-border", iconBg: "bg-emerald-500/10" },
  { accent: "text-blue-500", border: "border-border", iconBg: "bg-blue-500/10" },
  { accent: "text-violet-500", border: "border-border", iconBg: "bg-violet-500/10" },
];

export function ComparisonCards({ title, data, nameKey, dataKey = "value" }) {
  const avgRate = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + (item[dataKey] || 0), 0) / data.length) : 0;

  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const colors = CARD_COLORS[index % CARD_COLORS.length];
          const val = item[dataKey] || 0;
          const isAboveAvg = val > avgRate;
          return (
            <div
              key={item[nameKey]}
              className={`p-5 rounded-2xl border ${colors.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium text-foreground">{item[nameKey]}</span>
                <div className={`h-8 w-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                  {isAboveAvg ? (
                    <TrendingUp className={`h-4 w-4 ${colors.accent}`} />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </div>
              <p className={`text-3xl font-bold ${colors.accent}`}>{val}%</p>
              <p className="text-sm text-muted-foreground mt-2">{item.total || item.employees || 0} employees</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ComparisonCards;
