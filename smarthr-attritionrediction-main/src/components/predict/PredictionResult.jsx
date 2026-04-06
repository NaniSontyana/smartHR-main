import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp,
  Zap,
  Loader2,
  Download
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createActionLog } from "@/services/api";
import { toast } from "sonner";

export function PredictionResult({ prediction, formData }) {
  const getRiskLevel = (score) => {
    if (score >= 70) return { 
      level: "High", 
      color: "text-red-500", 
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      icon: AlertTriangle,
      description: "Immediate intervention recommended. This employee shows strong indicators of leaving."
    };
    if (score >= 40) return { 
      level: "Medium", 
      color: "text-amber-500", 
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      icon: AlertCircle,
      description: "Monitor closely. Consider proactive engagement and satisfaction assessment."
    };
    return { 
      level: "Low", 
      color: "text-emerald-500", 
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      icon: CheckCircle,
      description: "Employee appears satisfied and engaged. Continue current practices."
    };
  };

  const [isLogging, setIsLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const container = document.getElementById("prediction-result-card");
      if (!container) return;
      
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Attrition_Prediction_${formData.employeeId || "Report"}.pdf`);
      toast.success("Prediction report downloaded successfully.");
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

  const risk = getRiskLevel(prediction.riskScore);
  const RiskIcon = risk.icon;

  const handleLogAction = async () => {
    setIsLogging(true);
    try {
      await createActionLog({
        employeeId: formData.employeeId || "NEW_PREDICTION",
        title: "Retention Plan Initiated",
        description: `High risk (${prediction.riskScore}%) detected. HR has initiated a retention strategy based on identified factors.`,
        type: "system",
        user: "Admin HR"
      });
      setLogged(true);
      toast.success("Retention effort logged to audit trail.");
    } catch (error) {
      toast.error("Failed to log retention action.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Card id="prediction-result-card" className={`p-8 card-shadow animate-fade-in border-2 ${risk.borderColor}`}>
      <div className="flex flex-col items-center text-center mb-8 relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-0 right-0 gap-2"
          onClick={exportToPDF}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? "Exporting..." : "Export PDF"}
        </Button>
        <div className={`h-20 w-20 rounded-full ${risk.bgColor} flex items-center justify-center mb-4 mt-6`}>
          <RiskIcon className={`h-10 w-10 ${risk.color}`} />
        </div>
        <h2 className={`text-3xl font-bold ${risk.color} mb-2`}>
          {prediction.riskScore}%
        </h2>
        <p className={`text-xl font-semibold ${risk.color}`}>
          {risk.level} Attrition Risk
        </p>
      </div>

      <Progress 
        value={prediction.riskScore} 
        className="h-4 mb-6" 
      />

      <p className="text-base text-muted-foreground text-center mb-8">
        {risk.description}
      </p>

      {/* Key Factors */}
      {prediction.factors && prediction.factors.length > 0 && (
        <div className="border-t border-border pt-6 mt-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Key Risk Factors
          </h4>
          <div className="space-y-3">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{factor.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                      style={{ width: `${factor.impact}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{factor.impact}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Summary */}
      <div className="border-t border-border pt-6 mt-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Employee Profile Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Age</p>
            <p className="font-semibold">{formData.age || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Department</p>
            <p className="font-semibold">{formData.department || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Job Role</p>
            <p className="font-semibold">{formData.jobRole || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Monthly Income</p>
            <p className="font-semibold">${formData.monthlyIncome || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Years at Company</p>
            <p className="font-semibold">{formData.yearsAtCompany || "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Work-Life Balance</p>
            <p className="font-semibold">{formData.workLifeBalance || "N/A"}</p>
          </div>
        </div>
      </div>
      {/* Act Now Section */}
      <div className="border-t border-border pt-6 mt-8" data-html2canvas-ignore="true">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <div className="text-left">
            <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              Strategic Retention Action
            </h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Immediate action can reduce attrition risk by up to 40%. Log this prediction and start a retention plan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              className="w-full sm:w-auto px-6 h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              onClick={handleLogAction}
              disabled={isLogging || logged}
            >
              {isLogging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : logged ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Action Recorded
                </>
              ) : (
                "Log Retention Effort"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PredictionResult;
