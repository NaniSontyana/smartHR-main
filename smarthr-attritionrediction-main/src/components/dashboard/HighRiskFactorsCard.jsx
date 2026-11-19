import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, TrendingUp } from "lucide-react";

export function HighRiskFactorsCard({ data }) {
  const getBadge = (pct) => {
    if (pct >= 50) return { label: "Critical Driver", bg: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
    if (pct >= 30) return { label: "High Impact", bg: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    return { label: "Moderate", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  };

  return (
    <Card className="p-5 card-shadow h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            Top Flight Risk Drivers
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            ML feature importance & correlation across cohorts
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-2" viewportClassName="overscroll-y-contain">
        <div className="space-y-3 pb-2">
          {(!data || data.length === 0) ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No prominent risk drivers detected.
            </div>
          ) : (
            data.map((item) => {
              const badge = getBadge(item.percentage);
              return (
                <div
                  key={item.factor}
                  className="p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.factor}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Prevalence</span>
                      <span className="font-mono font-bold text-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

export default HighRiskFactorsCard;
