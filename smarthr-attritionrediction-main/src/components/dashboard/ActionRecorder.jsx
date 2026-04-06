import { Activity, Mail, DollarSign, Calendar, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TYPE_ICONS = {
  communication: <Mail className="h-4 w-4 text-blue-500" />,
  compensation: <DollarSign className="h-4 w-4 text-emerald-500" />,
  meeting: <Calendar className="h-4 w-4 text-amber-500" />,
  system: <Settings className="h-4 w-4 text-slate-500" />,
  default: <Activity className="h-4 w-4 text-primary" />
};

export function ActionRecorder({ history }) {
  if (!history || history.length === 0) {
    return (
      <Card className="p-5 card-shadow flex flex-col">
        <h3 className="font-semibold text-foreground mb-4">Action History</h3>
        <div className="flex-1 flex items-center justify-center opacity-70 py-6">
           <p className="text-sm text-muted-foreground">No recent actions recorded.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 card-shadow flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="font-semibold text-foreground">Action History</h3>
           <p className="text-xs text-muted-foreground">Recent retention efforts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
            <div className="px-6 py-4 border-b">
              <DialogHeader>
                <DialogTitle>Audit Log</DialogTitle>
                <DialogDescription>
                  A complete history of all system alerts and HR interventions.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="relative pl-3">
                {/* Vertical connecting line */}
                <div className="absolute top-2 bottom-2 left-5 w-px bg-border/60"></div>
                <div className="space-y-6">
                  {history.map((action) => {
                    const icon = TYPE_ICONS[action.type] || TYPE_ICONS.default;
                    return (
                      <div key={`modal-${action.id}`} className="relative flex items-start gap-4">
                        <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm ring-4 ring-background mt-0.5">
                          <div className="scale-75">{icon}</div>
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-foreground">{action.title}</p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{action.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                            {action.description}
                          </p>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                            By: {action.user}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative pl-3 flex-1 overflow-hidden">
        {/* Vertical connecting line */}
        <div className="absolute top-2 bottom-2 left-5 w-px bg-border/60"></div>

        <div className="space-y-6">
          {history.slice(0, 3).map((action) => {
            const icon = TYPE_ICONS[action.type] || TYPE_ICONS.default;
            
            return (
              <div key={action.id} className="relative flex items-start gap-4">
                {/* Timeline Node */}
                <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm ring-4 ring-background mt-0.5">
                  <div className="scale-75">{icon}</div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{action.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {action.description}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                    By: {action.user}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default ActionRecorder;
