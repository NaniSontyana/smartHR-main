import { useState } from "react";
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
import { Loader2, PlayCircle, CheckCircle } from "lucide-react";
import { runBatchPredictions } from "@/services/api";

export function BatchPredictDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleRun = async () => {
        setLoading(true);
        setResult(null);
        try {
            const data = await runBatchPredictions();
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
                        This process will analyze all active employees using the latest data and generate new attrition risk predictions for the current month.
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium">Analysis Complete!</h3>
                        <p className="text-muted-foreground">
                            Successfully generated predictions for <strong>{result.count}</strong> employees.
                        </p>
                    </div>
                ) : (
                    <div className="py-6">
                        <p className="text-sm text-muted-foreground text-center">
                            This may take a few seconds depending on the number of employees.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {result ? (
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    ) : (
                        <Button onClick={handleRun} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Analyzing..." : "Start Analysis"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
