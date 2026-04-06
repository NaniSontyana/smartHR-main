import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StatsCard({ icon, value, label, iconBgClass = "bg-primary/10", accentColor = "from-primary to-primary" }) {
  return (
    <Card className="relative overflow-hidden flex flex-col items-center justify-center p-6 card-shadow hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />
      <div className="flex w-full justify-end mb-2">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass} mb-3`}>
        {icon}
      </div>
      <span className="text-3xl font-bold text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </Card>
  );
}

export default StatsCard;
