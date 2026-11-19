import { DollarSign, TrendingDown, ShieldAlert, ArrowUpRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CapitalAtRiskCard({ stats }) {
  const capitalAtRisk = stats?.capitalAtRisk || 0;
  const potentialSavings = stats?.potentialRetentionSavings || 0;
  const avgCost = stats?.avgReplacementCost || 45000;

  const formatCurrency = (val) => {
    if (!val || val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <Card className="relative overflow-hidden p-6 border border-rose-500/20 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-200 tracking-wide uppercase text-xs">
                Financial Impact
              </h3>
              <p className="text-xs text-slate-400">Capital at Risk Engine</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[11px] font-medium bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full">
            75% Benchmark
          </span>
        </div>

        {/* Primary Hazard Value */}
        <div className="pt-1">
          <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            {formatCurrency(capitalAtRisk)}
            <span className="text-xs font-normal text-rose-400 font-sans">loss hazard</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Projected turnover replacement liability across active workforce
          </p>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Mitigable Savings
            </div>
            <div className="text-base font-bold text-emerald-300 mt-0.5">
              {formatCurrency(potentialSavings)}
            </div>
            <div className="text-[10px] text-slate-400">Via retention levers</div>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Avg Replacement
            </div>
            <div className="text-base font-bold text-slate-200 mt-0.5">
              {formatCurrency(avgCost)}
            </div>
            <div className="text-[10px] text-slate-400">Per departed head</div>
          </div>
        </div>

        {/* Call to action */}
        <Link to="/predict" className="block pt-1">
          <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 gap-1.5 transition-all">
            Open What-If Simulator
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default CapitalAtRiskCard;
