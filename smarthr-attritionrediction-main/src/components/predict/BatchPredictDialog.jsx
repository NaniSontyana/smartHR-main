import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, PlayCircle, CheckCircle } from "lucide-react";
import { runBatchPredictions } from "@/services/api";
import { getSocket } from "@/services/socket";

export function BatchPredictDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!loading) return;
        const socket = getSocket();
        const handleProgress = (data) => {
            if (data.percent !== undefined) {
                setProgress(data.percent);
            }
        };
        socket.on("batch:progress", handleProgress);
        return () => {
            socket.off("batch:progress", handleProgress);
        };
    }, [loading]);

    const handleRun = async () => {
        setLoading(true);
        setProgress(15);
        setResult(null);
        try {
            const data = await runBatchPredictions();
            setProgress(100);
            setResult(data);
        } catch (error) {
            console.error("Batch run failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Run Monthly Analysis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Run Monthly Analysis</DialogTitle>
                    <DialogDescription>
                        This process will analyze all active employees using the live ML microservice and update attrition risk predictions in real time.
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="h-12 w-12 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-medium">Analysis Complete!</h3>
                        <p className="text-muted-foreground text-sm">
                            Successfully generated and stored predictions for <strong>{result.count}</strong> employees.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="py-6 space-y-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                Evaluating workforce with ML model...
                            </span>
                            <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                ) : (
                    <div className="py-6">
                        <p className="text-sm text-muted-foreground text-center">
                            Vectorized processing evaluates all employee records in parallel across the ML pipeline.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {result ? (
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    ) : (
                        <Button onClick={handleRun} disabled={loading}>
                            {loading ? "Analyzing Workforce..." : "Start Analysis"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default BatchPredictDialog;
