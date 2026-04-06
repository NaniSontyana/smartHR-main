import { MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const RISK_COLORS = [
  { bg: "from-rose-500/15 to-pink-500/5", text: "text-rose-500", border: "border-rose-500/20" },
  { bg: "from-amber-500/15 to-orange-500/5", text: "text-amber-500", border: "border-amber-500/20" },
  { bg: "from-blue-500/15 to-cyan-500/5", text: "text-blue-500", border: "border-blue-500/20" },
  { bg: "from-violet-500/15 to-purple-500/5", text: "text-violet-500", border: "border-violet-500/20" },
];

export function HighRiskFactorsCard({ data }) {
  return (
    <Card className="p-5 card-shadow h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-foreground">High Risk Factors</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-4" viewportClassName="overscroll-y-contain">
        <div className="space-y-3 pb-2">
          {data.map((item, index) => {
            const colors = RISK_COLORS[index % RISK_COLORS.length];
            return (
              <div
                key={item.factor}
                className={`p-3 rounded-xl bg-gradient-to-r ${colors.bg} border ${colors.border} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.factor}</p>
                    <p className="text-xs text-muted-foreground">{item.department}</p>
                  </div>
                  <span className={`text-lg font-bold ${colors.text}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

export default HighRiskFactorsCard;
