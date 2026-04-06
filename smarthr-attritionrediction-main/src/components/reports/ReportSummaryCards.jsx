import { Card } from "@/components/ui/card";
import { TrendingUp, Users, AlertTriangle, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARDS_CONFIG = [
  {
    icon: TrendingUp,
    key: "overallAttritionRate",
    suffix: "%",
    label: "Overall Attrition Rate", 
    accentColor: "from-rose-500 to-orange-400",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  {
    icon: AlertTriangle,
    key: "highRiskEmployees",
    suffix: "",
    label: "High Risk Employees",
    accentColor: "from-amber-500 to-orange-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    key: "attritionCount",
    suffix: "",
    label: "Left This Year",
    accentColor: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Clock,
    key: "avgTenure",
    suffix: " yrs",
    label: "Average Tenure",
    accentColor: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
];

export function ReportSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {CARDS_CONFIG.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="relative overflow-hidden flex flex-col items-center justify-center p-6 card-shadow hover:shadow-lg transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`} />
            <div className="flex w-full justify-end mb-2 h-6">
              {/* Optional space for future actions, leaving empty to match height or can be removed entirely */}
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} mb-3`}>
              <Icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <span className="text-3xl font-bold text-foreground">
              {summary[card.key]}{card.suffix}
            </span>
            <span className="text-sm text-muted-foreground mt-1 text-center leading-tight">
              {card.label}
            </span>
          </Card>
        );
      })}
    </div>
  );
}

export default ReportSummaryCards;
