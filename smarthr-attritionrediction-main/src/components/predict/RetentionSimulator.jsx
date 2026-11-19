import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Zap, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Award, 
  Smile, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { simulateIntervention, createActionLog } from "@/services/api";
import { toast } from "sonner";

export function RetentionSimulator({ employeeData, onApplied }) {
  const [salaryIncrease, setSalaryIncrease] = useState(750);
  const [removeOvertime, setRemoveOvertime] = useState(true);
  const [improveSatisfaction, setImproveSatisfaction] = useState(1);
  const [workLifeBalanceBoost, setWorkLifeBalanceBoost] = useState(1);
  const [promotion, setPromotion] = useState(false);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [applied, setApplied] = useState(false);

  // Baseline normalization
  const baseSalary = parseInt(employeeData?.monthlyIncome || employeeData?.MonthlyIncome || 4500);
  const currentOvertime = (employeeData?.overTime || employeeData?.overtime || "No") === "Yes";

  const handleSimulate = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const response = await simulateIntervention(employeeData, {
        salaryIncrease: Number(salaryIncrease),
        removeOvertime: Boolean(removeOvertime),
        improveSatisfaction: Number(improveSatisfaction),
        workLifeBalanceBoost: Number(workLifeBalanceBoost),
        promotion: Boolean(promotion),
      });

      if (response?.success) {
        setSimResult(response);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
      toast.error("Could not run counterfactual simulation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData) {
      handleSimulate();
    }
  }, [employeeData]);

  const handleApplyPackage = async () => {
    if (!simResult) return;
    try {
      const empId = employeeData?.employeeId || employeeData?._id || "EMP";
      const empName = employeeData?.name || empId;

      await createActionLog({
        employeeId: empId,
        title: "Counterfactual Retention Plan Committed",
        description: `Approved retention package: +$${salaryIncrease}/mo salary increase, ${removeOvertime ? 'eliminated overtime, ' : ''}satisfaction boost. Projected risk drop: -${simResult.impact?.riskDelta}% with estimated ROI of +${simResult.impact?.roiPercentage}%.`,
        type: "retention_counteroffer",
        user: "Admin HR",
      });

      setApplied(true);
      toast.success(`Retention offer logged for ${empName}!`);
      if (onApplied) onApplied();
    } catch (err) {
      toast.error("Failed to commit retention action.");
    }
  };

  const formatMoney = (val) => `$${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Counterfactual "What-If" Retention Simulator
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/30 text-blue-300 rounded uppercase">
                Machine Learning Levers
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Test intervention packages in real time to calculate risk reduction and financial ROI before extending offers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Levers */}
        <div className="col-span-12 lg:col-span-6 space-y-5 p-5 rounded-xl border border-slate-700/60 bg-slate-900/50">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Retention Levers & Interventions
          </h5>

          {/* Lever 1: Salary Bump */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label className="text-slate-200 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                Monthly Compensation Increase
              </Label>
              <span className="font-semibold text-emerald-400">
                +${salaryIncrease}/mo (New: ${baseSalary + Number(salaryIncrease)})
              </span>
            </div>
            <Slider
              value={[salaryIncrease]}
              min={0}
              max={3000}
              step={100}
              onValueChange={([val]) => setSalaryIncrease(val)}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$0</span>
              <span>+$1,500</span>
              <span>+$3,000</span>
            </div>
          </div>

          {/* Lever 2: Overtime */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
            <div className="space-y-0.5">
              <Label className="text-xs text-slate-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Eliminate Overtime Mandate
              </Label>
              <p className="text-[11px] text-slate-400">
                Current: {currentOvertime ? "Overtime Active (Burnout Hazard)" : "No Overtime"}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={removeOvertime ? "default" : "outline"}
              className={removeOvertime ? "bg-amber-600 hover:bg-amber-500 text-white text-xs h-8" : "text-xs h-8"}
              onClick={() => setRemoveOvertime(!removeOvertime)}
            >
              {removeOvertime ? "Capped to 40h" : "Uncapped"}
            </Button>
          </div>

          {/* Lever 3: Work-Life Balance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label className="text-slate-200 flex items-center gap-1.5">
                <Smile className="h-3.5 w-3.5 text-cyan-400" />
                Work-Life Balance / Hybrid Flexibility
              </Label>
              <span className="font-semibold text-cyan-400">
                {workLifeBalanceBoost === 0 ? "No Change" : workLifeBalanceBoost === 1 ? "+1 (2 Days Remote)" : "+2 (Full Flex)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((lvl) => (
                <Button
                  key={lvl}
                  type="button"
                  size="sm"
                  variant={workLifeBalanceBoost === lvl ? "default" : "outline"}
                  className={workLifeBalanceBoost === lvl ? "bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8" : "text-xs h-8"}
                  onClick={() => setWorkLifeBalanceBoost(lvl)}
                >
                  {lvl === 0 ? "Baseline" : lvl === 1 ? "+1 Hybrid" : "+2 Full Flex"}
                </Button>
              ))}
            </div>
          </div>

          {/* Lever 4: Role Promotion */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
            <div className="space-y-0.5">
              <Label className="text-xs text-slate-200 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-purple-400" />
                Promotion / Title Progression
              </Label>
              <p className="text-[11px] text-slate-400">
                Grant clear career progression & senior responsibility
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={promotion ? "default" : "outline"}
              className={promotion ? "bg-purple-600 hover:bg-purple-500 text-white text-xs h-8" : "text-xs h-8"}
              onClick={() => setPromotion(!promotion)}
            >
              {promotion ? "Promote" : "No Promotion"}
            </Button>
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-9 gap-2 shadow-lg"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Evaluating Neural Forest..." : "Recalculate Retention Impact"}
          </Button>
        </div>

        {/* Right Column: Simulated Outcomes */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {simResult ? (
            <div className="space-y-4">
              {/* Risk Reduction Gauge */}
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hazard Probability Shift
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    -{simResult.impact?.riskDelta}% Hazard Drop
                  </span>
                </div>

                <div className="flex items-center justify-around py-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-center">
                    <div className="text-[11px] text-slate-400">Baseline Risk</div>
                    <div className="text-2xl font-extrabold text-rose-500">
                      {simResult.baseline?.riskScore}%
                    </div>
                    <div className="text-[10px] text-rose-400 font-semibold uppercase">
                      {simResult.baseline?.riskLevel} Risk
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-500" />

                  <div className="text-center">
                    <div className="text-[11px] text-slate-400">Simulated Risk</div>
                    <div className="text-2xl font-extrabold text-emerald-400">
                      {simResult.simulated?.riskScore}%
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                      {simResult.simulated?.riskLevel} Risk
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Return on Investment */}
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    Financial ROI Model
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {simResult.impact?.roiPercentage > 0 ? `+${simResult.impact?.roiPercentage}% ROI` : "Neutral"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Avoided Loss</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {formatMoney(simResult.impact?.avoidedLoss)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Annual Cost</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {formatMoney(simResult.impact?.annualInterventionCost)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Net Profit</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {formatMoney(simResult.impact?.netSavings)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Neutralized Factors */}
              {simResult.impact?.neutralizedFactors?.length > 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Neutralized Flight Drivers
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {simResult.impact.neutralizedFactors.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 rounded-full flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Action Button */}
              <Button
                onClick={handleApplyPackage}
                disabled={applied}
                className={applied 
                  ? "w-full bg-emerald-700 text-white text-xs h-10 font-bold" 
                  : "w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-10 font-bold shadow-lg shadow-emerald-900/30 gap-1.5"}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Retention Offer Committed to Audit Trail
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Commit Retention Offer Package
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-center p-6 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs">Computing counterfactual pipeline...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RetentionSimulator;
