import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  DollarSign, 
  ShieldAlert, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Download,
  Loader2,
  TrendingDown
} from "lucide-react";
import { getRetentionPlaybook, createActionLog } from "@/services/api";
import { toast } from "sonner";

export function RetentionPlaybookDialog({ employee, isOpen, onClose, onActionLogged }) {
  const [playbook, setPlaybook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      const fetchPlaybook = async () => {
        setLoading(true);
        setLogged(false);
        try {
          const empId = employee.id || employee._id || employee.employeeId;
          const data = await getRetentionPlaybook(empId);
          setPlaybook(data);
        } catch (err) {
          console.error("Failed to load retention playbook:", err);
          toast.error("Could not load prescriptive retention playbook.");
        } finally {
          setLoading(false);
        }
      };
      fetchPlaybook();
    }
  }, [isOpen, employee]);

  const handleCommitPlaybook = async () => {
    if (!playbook) return;
    try {
      await createActionLog({
        employeeId: playbook.employeeId,
        title: "Prescriptive Playbook Deployed",
        description: `Initiated prescriptive retention playbook for ${playbook.name} (${playbook.role}). Manager 1-on-1 talking points dispatched to People Lead.`,
        type: "retention_playbook",
        user: "Admin HR",
      });
      setLogged(true);
      toast.success("Retention playbook logged to audit trail!");
      if (onActionLogged) onActionLogged();
    } catch (err) {
      toast.error("Failed to log playbook.");
    }
  };

  const formatCurrency = (val) => `$${Math.round(val || 0).toLocaleString()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100 p-6">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  Prescriptive Retention Playbook
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full font-semibold">
                    1-Click Action Plan
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Tailored intervention strategy and manager talking script based on explainable risk drivers.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
            <p className="text-xs">Generating bespoke retention playbook...</p>
          </div>
        ) : playbook ? (
          <div className="space-y-5 pt-2">
            {/* Employee Profile Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{playbook.name}</h4>
                <p className="text-xs text-slate-400">{playbook.role} • {playbook.department}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Capital Replacement Loss</span>
                  <span className="text-xs font-bold text-rose-400">{formatCurrency(playbook.replacementCost)}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs">
                  {playbook.riskScore}% Hazard
                </div>
              </div>
            </div>

            {/* Prescriptive Interventions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
                Recommended Counter-Offer Levers
              </h5>
              <div className="space-y-2">
                {playbook.recommendedLevers?.map((lever, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{lever.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          {lever.expectedRiskReduction} hazard
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{lever.description}</p>
                    </div>
                    {lever.financialCost > 0 && (
                      <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded whitespace-nowrap">
                        {formatCurrency(lever.financialCost)}/yr
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Manager 1-on-1 Script */}
            {playbook.managerScript && (
              <div className="space-y-2.5 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  Manager 1-on-1 Check-In Script
                </h5>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs italic text-slate-300">
                  "{playbook.managerScript.opening}"
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-300 block">Guided Probing Questions:</span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {playbook.managerScript.probingQuestions?.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Commit Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400">
                Close
              </Button>
              <Button
                onClick={handleCommitPlaybook}
                disabled={logged}
                className={logged 
                  ? "bg-emerald-700 text-white text-xs font-semibold"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-lg shadow-indigo-900/30"}
              >
                {logged ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Playbook Deployed to Audit
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Deploy Playbook & Log Action
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default RetentionPlaybookDialog;
