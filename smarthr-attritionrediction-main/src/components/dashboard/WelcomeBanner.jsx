import { Card } from "@/components/ui/card";
import { Sparkles, Shield, Cpu, Activity } from "lucide-react";

export function WelcomeBanner({ userName, date }) {
  return (
    <Card className="relative overflow-hidden p-6 border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-y-10 -translate-x-10 pointer-events-none" />
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3" /> Executive Command Center
          </span>
          <span className="text-xs text-slate-400 font-mono">{date}</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Workforce Retention Intelligence
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Real-time organizational flight hazard telemetry, counterfactual ROI modeling, and prescriptive 1-click intervention playbooks.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-slate-300 font-medium">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            Balanced Random Forest
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-slate-300 font-medium">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Live WebSockets Streaming
          </span>
        </div>
      </div>
    </Card>
  );
}

export default WelcomeBanner;
