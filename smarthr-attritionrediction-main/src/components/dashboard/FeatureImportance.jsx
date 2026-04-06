import { MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROGRESS_COLORS = [
  "from-rose-500 to-pink-400",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-orange-400",
];

export function FeatureImportance({ data }) {
  return (
    <Card className="p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Feature Importance</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.feature} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.feature}</span>
              <span className="font-semibold text-foreground">{item.importance}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${PROGRESS_COLORS[index % PROGRESS_COLORS.length]} transition-all duration-500`}
                style={{ width: `${item.importance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default FeatureImportance;
