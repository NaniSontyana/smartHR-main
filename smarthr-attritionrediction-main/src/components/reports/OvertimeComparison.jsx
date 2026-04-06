import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OvertimeComparison({ data }) {
  const overtimeYes = data.find((d) => d.status === "Yes");
  const overtimeNo = data.find((d) => d.status === "No");
  const multiplier = Math.round((overtimeYes?.attritionRate / overtimeNo?.attritionRate) * 10) / 10;

  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Overtime Impact on Attrition</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-rose-500" />
            </div>
            <span className="text-base font-medium text-foreground">With Overtime</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            {overtimeYes?.attritionRate}%
          </p>
          <p className="text-sm text-muted-foreground mt-3">{overtimeYes?.employees} employees</p>
        </div>
        <div className="p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-base font-medium text-foreground">No Overtime</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {overtimeNo?.attritionRate}%
          </p>
          <p className="text-sm text-muted-foreground mt-3">{overtimeNo?.employees} employees</p>
        </div>
      </div>
      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
        <p className="text-sm text-foreground">
          Employees with overtime are{" "}
          <span className="font-bold text-rose-500">{multiplier}x more likely</span>{" "}
          to leave the company
        </p>
      </div>
    </Card>
  );
}

export default OvertimeComparison;
