import { Mail, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { sendReviewEmail, createNotification, createActionLog } from "@/services/api";

export function MailingManagement({ employees, onActionLogged }) {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(null);
  const [sentEmails, setSentEmails] = useState(new Set());

  // Filter for > 90% risk, sort descending, limit to 50 for performance
  const criticalEmployees = (employees?.filter(emp => emp.riskScore > 90) || [])
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 50);

  const handleSendEmail = async (employeeId, name, department, riskScore) => {
    try {
      const emailAddress = `${name?.split(' ').join('.').toLowerCase() || 'employee'}@company.com`;
      const result = await sendReviewEmail({ 
        to: emailAddress,
        employeeId, 
        employeeName: name, 
        department, 
        riskScore 
      });
      
      setOpenModal(null);
      setSentEmails(prev => new Set([...prev, employeeId]));
      
      toast({
        title: "Email Sent Successfully",
        description: `Invitation sent to ${name}.`,
        duration: 4000,
      });
      
      if (result?.success) {
         // Record Action Log
         await createActionLog({
           title: "Email Sent",
           description: `Sent performance review invite to ${name}`,
           type: "communication",
           employeeId: employeeId,
           user: "Admin HR"
         });

         // Dispatch custom event for notifications
         window.dispatchEvent(new CustomEvent('employee-response', { 
           detail: { 
             name: name,
             message: "Drafting a response..."
           } 
         }));
         
         if (onActionLogged) {
            onActionLogged();
         }
      }
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "There was an error triggering the SMTP backend.",
        variant: "destructive"
      });
    }
  };

  const handleSendAll = async () => {
    toast({
      title: "Initiating Bulk Send",
      description: `Preparing to send ${criticalEmployees.length} emails...`,
      duration: 2000,
    });
    
    // Send sequentially to avoid spamming rate limits
    for (const emp of criticalEmployees) {
      if (!sentEmails.has(emp.id || emp._id)) {
        await handleSendEmail(emp.id || emp._id, emp.name, emp.department, emp.riskScore);
      }
    }
    
    toast({
      title: "Bulk Email Sequence Complete",
      description: `Successfully emailed ${criticalEmployees.length} high-risk employees.`,
      duration: 4000,
    });
  };

  if (!criticalEmployees || criticalEmployees.length === 0) {
    return (
      <Card className="p-5 card-shadow h-[400px] flex flex-col hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Mailing Management
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-70">
           <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
           <p className="text-sm font-medium text-foreground text-center">No critical interventions needed.</p>
           <p className="text-xs text-muted-foreground mt-1">Zero employees &gt; 90% risk.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 card-shadow h-[400px] flex flex-col hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Mailing Management
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top 50 Critical Risk (&gt;90%)</p>
        </div>
        {criticalEmployees.length > 0 && sentEmails.size < criticalEmployees.length && (
          <Button variant="outline" size="sm" onClick={handleSendAll} className="h-7 text-xs gap-1">
            <Send className="h-3 w-3" />
            Email All
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-4 -mr-4" viewportClassName="overscroll-y-contain px-1">
        <div className="space-y-3 pb-2">
          {criticalEmployees.map((emp) => {
            const empId = emp.id || emp._id;
            const isSent = sentEmails.has(empId);
            const emailAddress = `${emp.name?.split(' ').join('.').toLowerCase() || 'employee'}@company.com`;
            
            return (
              <div
                key={empId}
                className={`p-3 rounded-xl border transition-all duration-300 bg-card ${isSent ? 'opacity-70 border-emerald-200 bg-emerald-50/10 scale-[0.98]' : 'border-rose-100 hover:border-rose-300 hover:shadow-md'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg transition-colors ${isSent ? 'bg-emerald-100/50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isSent ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate mr-2">{emp.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isSent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {emp.riskScore}% RISK
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{emp.jobRole || emp.role} • {emp.department}</p>
                    
                    <Dialog open={openModal === empId} onOpenChange={(open) => !open && setOpenModal(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant={isSent ? "secondary" : "default"} 
                          size="sm" 
                          className={`w-full text-xs h-8 transition-all ${!isSent ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow' : 'opacity-80'}`}
                          onClick={() => setOpenModal(empId)}
                          disabled={isSent}
                        >
                          <Mail className="h-3 w-3 mr-1.5" />
                          {isSent ? "Invitation Sent" : "Draft Review Invite"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Send Invitation to {emp.name}</DialogTitle>
                          <DialogDescription>
                            Draft an automated email to schedule a 1-on-1 retention review.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-sm font-mono text-slate-700">
                            <strong>To:</strong> {emailAddress}<br/>
                            <strong>Subject:</strong> High Risk Review - {emp.name}<br/>
                            <br/>
                            Hi {emp.name.split(' ')[0]},<br/>
                            <br/>
                            I'd like to schedule a brief 1-on-1 review with you this week to discuss your current role in the {emp.department} department.<br/>
                            <br/>
                            Best regards,<br/>
                            HR Management Support
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
                          <Button onClick={() => handleSendEmail(empId, emp.name, emp.department, emp.riskScore)} className="bg-blue-600 hover:bg-blue-700">
                            <Send className="h-4 w-4 mr-2" />
                            Send Email
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

export default MailingManagement;
