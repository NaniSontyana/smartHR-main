import { useState, useEffect } from "react";
import { AlertTriangle, MoreHorizontal, Loader2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getHighRiskEmployees, getActionLogs, createActionLog, sendReviewEmail } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  User, 
  History, 
  MessageSquare, 
  Briefcase as RoleIcon,
  Send,
  UserPlus,
  Sparkles
} from "lucide-react";
import { RetentionPlaybookDialog } from "./RetentionPlaybookDialog";

export function HighRiskEmployees({
  employees: initialEmployees = [], // prop is less relevant now as we fetch all
  onActionLogged,
}) {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getHighRiskEmployees();
        setAllEmployees(data);
      } catch (error) {
        console.error("Failed to load high risk employees", error);
        // Fallback to initial props if fetch fails (though it might be empty/partial)
        setAllEmployees(initialEmployees);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [initialEmployees]); // Depend on initialEmployees only if we want to reset/refetch when parent updates

  const getRiskColor = (score) => {
    if (score >= 75) return "text-rose-500";
    if (score >= 50) return "text-amber-500";
    return "text-emerald-500";
  };

  const handleEmployeeClick = async (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setLogsLoading(true);
    try {
      const logs = await getActionLogs(employee.id || employee._id);
      setEmployeeLogs(logs);
    } catch (error) {
      console.error("Failed to load logs for employee", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAction = async (type) => {
    if (!selectedEmployee) return;

    const actionData = {
      employeeId: selectedEmployee.id || selectedEmployee._id,
      user: "Admin HR",
    };

    try {
      if (type === 'review') {
        actionData.title = "Review Invite Sent";
        actionData.description = `Sent a satisfaction review invite to ${selectedEmployee.name}.`;
        actionData.type = "communication";
        
        await sendReviewEmail({
           to: selectedEmployee.email || "employee@company.com",
           subject: "Quarterly Satisfaction Review",
           employeeName: selectedEmployee.name
        });
      } else if (type === 'meeting') {
        actionData.title = "1-on-1 Scheduled";
        actionData.description = `Scheduled a retention check-in meeting with ${selectedEmployee.name}.`;
        actionData.type = "meeting";
      }

      const newLog = await createActionLog(actionData);
      if (newLog) {
        setEmployeeLogs(prev => [newLog, ...prev]);
        toast.success(`${actionData.title} successfully!`);
        if (onActionLogged) onActionLogged();
      }
    } catch (error) {
      console.error("Action process error:", error);
      const errorMessage = error.response?.data?.message || "Failed to process HR action. Please try again later.";
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  const TYPE_ICONS = {
    communication: <MessageSquare className="h-4 w-4 text-blue-500" />,
    compensation: <History className="h-4 w-4 text-emerald-500" />,
    meeting: <Calendar className="h-4 w-4 text-amber-500" />,
    system: <History className="h-4 w-4 text-slate-500" />,
    default: <History className="h-4 w-4 text-primary" />
  };
  const filteredEmployees = allEmployees
    .filter((emp) => (emp.riskScore || emp.probability * 100) >= 70)
    .sort((a, b) => (b.riskScore || b.probability * 100) - (a.riskScore || a.probability * 100))
    .slice(0, 50);

  return (
    <Card className="p-5 card-shadow h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">High-Risk Employees</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Predicted High Attrition Risk (≥70%)</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-4" viewportClassName="overscroll-y-contain">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-80 py-10">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No High Risk Employees</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">Everyone is under 70% attrition risk this month.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map((employee, index) => (
              <div
                key={`${employee.id}-${index}`}
                className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 rounded-lg px-2 transition-colors -mx-2"
                onClick={() => handleEmployeeClick(employee)}
              >
                <div className="flex items-center gap-3">
                  {employee.riskScore >= 75 && (
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  )}
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {employee.name
                        ? employee.name.split(" ").map((n) => n[0]).join("")
                        : "EMP"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {employee.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employee.role} · {employee.department}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${getRiskColor(employee.riskScore)}`}>
                  {employee.riskScore}%
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Employee Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {selectedEmployee && (
            <>
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarFallback className="text-xl">
                      {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-2xl font-bold">{selectedEmployee.name}</DialogTitle>
                      <DialogDescription className="text-base flex items-center gap-2 mt-1">
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                        {selectedEmployee.role} · {selectedEmployee.department}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex items-center gap-4">
                       <div className="bg-background rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                           <AlertTriangle className={`h-4 w-4 ${getRiskColor(selectedEmployee.riskScore)}`} />
                           <span className="text-sm font-bold">{selectedEmployee.riskScore}% Attrition Risk</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b bg-muted/5">
                   <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Retention Actions</p>
                   <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
                        onClick={() => setIsPlaybookOpen(true)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Retention Playbook
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                        onClick={() => handleAction('review')}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Review Invite
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                        onClick={() => handleAction('meeting')}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Schedule 1-on-1
                      </Button>
                   </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-2 text-sm font-semibold text-foreground bg-muted/10 border-b">
                  <History className="h-4 w-4" />
                  Intervention History & System Alerts
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : employeeLogs.length === 0 ? (
                    <div className="text-center py-10 opacity-70">
                       <p className="text-sm text-muted-foreground">No history items recorded for this employee yet.</p>
                    </div>
                  ) : (
                    <div className="relative pl-3">
                      <div className="absolute top-2 bottom-2 left-5 w-px bg-border/60"></div>
                      <div className="space-y-6">
                        {employeeLogs.map((log) => (
                          <div key={log._id} className="relative flex items-start gap-4">
                            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm ring-4 ring-background">
                              <div className="scale-75">{TYPE_ICONS[log.type] || TYPE_ICONS.default}</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-semibold text-foreground">{log.title}</p>
                                <span className="text-[10px] text-muted-foreground">{log.date}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1 leading-relaxed">
                                {log.description}
                              </p>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                                By: {log.user}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <RetentionPlaybookDialog
        employee={selectedEmployee}
        isOpen={isPlaybookOpen}
        onClose={() => setIsPlaybookOpen(false)}
        onActionLogged={onActionLogged}
      />
    </Card>
  );
}

export default HighRiskEmployees;
