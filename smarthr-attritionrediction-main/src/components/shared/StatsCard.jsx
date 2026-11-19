import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export function StatsCard({ icon, value, label, iconBgClass = "bg-primary/10", accentColor = "from-primary to-primary", trend }) {
  const getSubtext = () => {
    if (label.toLowerCase().includes("total")) return "Monitored active cohort";
    if (label.toLowerCase().includes("attrition")) return "Predicted hazard index";
    if (label.toLowerCase().includes("satisfaction")) return "Company aggregate score";
    return "Enterprise metric";
  };

  return (
    <Card className="relative overflow-hidden p-5 card-shadow hover:border-primary/40 transition-all duration-200 flex flex-col justify-between">
      {/* Top Hairline Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />

      {/* Header Row */}
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgClass}`}>
          {icon}
        </div>
      </div>

      {/* Metric Value */}
      <div className="mt-3">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{getSubtext()}</span>
        </div>
      </div>
    </Card>
  );
}

export default StatsCard;
