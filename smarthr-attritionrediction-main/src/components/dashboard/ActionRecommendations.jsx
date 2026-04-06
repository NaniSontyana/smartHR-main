import { MoreHorizontal, AlertCircle, TrendingUp, Users, ArrowRight } from "lucide-react";
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
import { useState, useEffect } from "react";
import { createActionLog } from "@/services/api";

const ACTION_STYLES = {
  high: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-600",
    icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
    badge: "bg-rose-500/20 text-rose-600"
  },
  medium: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-600",
    icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
    badge: "bg-amber-500/20 text-amber-600"
  },
  low: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600",
    icon: <Users className="h-4 w-4 text-blue-500" />,
    badge: "bg-blue-500/20 text-blue-600"
  }
};

export function ActionRecommendations({ data }) {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(null);

  const handleActionComplete = (item) => {
    setOpenModal(null);
    
    // Record Action Log in Backend
    createActionLog({
        title: item.title,
        description: `Completed: ${item.description}`,
        type: item.type,
        employeeId: item.employeeId,
        user: "Admin HR"
    });

    toast({
      title: "Action Completed",
      description: `Successfully initiated: ${item.actionText}`,
      duration: 3000,
    });
  };

  const renderModalContent = (item) => {
    if (!item) return null;

    if (item.type === "high") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>
              Draft an email to department managers to schedule 1-on-1s.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md text-sm font-mono text-muted-foreground">
              To: r&d_managers@company.com<br/>
              Subject: Urgent: Schedule Retention 1-on-1s<br/>
              <br/>
              Hi team,<br/>
              <br/>
              Our attrition model has flagged 'Work Environment' as a critical risk factor for 30% of engineering staff. Please ensure all managers schedule 15-minute check-ins with their reports this week.<br/>
              <br/>
              Thanks, HR
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => handleActionComplete(item)}>Send Email</Button>
          </DialogFooter>
        </>
      );
    }
    
    if (item.type === "medium") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>
              Review compensation metrics for the Sales department.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium">Avg Base Pay</span>
                <span className="text-sm text-rose-500 font-bold">-12% vs Market</span>
             </div>
             <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium">Avg Commission</span>
                <span className="text-sm text-emerald-500 font-bold">+8% vs Market</span>
             </div>
             <p className="text-xs text-muted-foreground italic">
               Recommendation: Increase base pay limits by 10% to stabilize income volatility.
             </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Close</Button>
            <Button onClick={() => handleActionComplete(item)}>Approve Pay Adjustment</Button>
          </DialogFooter>
        </>
      );
    }

    return (
        <>
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>
              {item.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex items-center justify-center">
             <div className="bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                24 employees approaching milestone
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => handleActionComplete(item)}>Set Calendar Reminders</Button>
          </DialogFooter>
        </>
    );
  };

  // If no data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <Card className="p-5 card-shadow h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="font-semibold text-foreground">Next Steps</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-70">
           <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
           <p className="text-sm text-foreground">No pending recommendations.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 card-shadow h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-foreground">Action Recommendations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI-suggested next steps</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-4 -mr-4" viewportClassName="overscroll-y-contain px-1">
        <div className="space-y-3 pb-2">
          {data.map((item, index) => {
            const styles = ACTION_STYLES[item.type] || ACTION_STYLES.medium;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] bg-card ${styles.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg ${styles.bg}`}>
                    {styles.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {item.description}
                    </p>
                    <Dialog open={openModal === index} onOpenChange={(open) => !open && setOpenModal(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-8 group"
                          onClick={() => setOpenModal(index)}
                        >
                          {item.actionText}
                          <ArrowRight className="h-3 w-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        {renderModalContent(item)}
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

export default ActionRecommendations;
