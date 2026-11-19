import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Briefcase,
  DollarSign,
  Clock,
  Heart,
  Brain,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";

import { predictAttrition, getEmployees } from "@/services/api";
import { PredictionFormSection } from "@/components/predict/PredictionFormSection";
import { PredictionResult } from "@/components/predict/PredictionResult";
import { RetentionSimulator } from "@/components/predict/RetentionSimulator";
import {
  departments,
  jobRoles,
  overtimeOptions,
  satisfactionLevels,
  stockOptionLevels,
  defaultFormData,
} from "@/data/predictionOptions";

import { BatchPredictDialog } from "@/components/predict/BatchPredictDialog";
import { toast } from "sonner";

export function Predict() {
  const [inputMode, setInputMode] = useState("manual");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [formData, setFormData] = useState(defaultFormData);
  const [prediction, setPrediction] = useState(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]); // State for employees

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        console.log("Fetched employees:", response);
        setEmployeeList(response.employees || []);
      } catch (error) {
        console.error("Failed to fetch employees for dropdown", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    const employee = employeeList.find((e) => (e._id || e.id).toString() === employeeId);
    if (employee) {
      setFormData({
        ...defaultFormData,
        employeeId: employee._id || employee.id,
        email: employee.email || (employee.name ? `${employee.name.split(' ').join('.').toLowerCase()}@company.com` : ""),
        age: employee.age?.toString() || "",
        department: employee.department,
        jobRole: employee.jobRole,
        monthlyIncome: employee.monthlyIncome?.toString() || "",
        yearsAtCompany: employee.yearsAtCompany?.toString() || "",
      });
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setIsLoading(true);

    try {
      const response = await predictAttrition({
        ...formData,
        employeeId: selectedEmployee || undefined
      });

      if (response.success) {
        const result = response.data;
        
        // Use real explainability factors from the ML engine, with fallback heuristics
        const factors = (result.factors && result.factors.length > 0)
          ? result.factors
          : [
              ...(formData.overTime === 'Yes' && result.probability > 0.4 ? [{ name: "High Overtime", impact: 15 }] : []),
              ...(parseInt(formData.monthlyIncome) < 4000 ? [{ name: "Competitiveness", impact: 20 }] : []),
              ...(parseInt(formData.jobSatisfaction) <= 2 ? [{ name: "Job Satisfaction", impact: 35 }] : [])
            ];
        
        setPrediction({
          riskScore: Math.round(result.probability * 100),
          riskLevel: result.riskLevel,
          factors: factors.length > 0 ? factors : [{ name: "Predictive Pattern", impact: Math.round(result.probability * 100) }]
        });
        setIsResultOpen(true);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      toast.error("Failed to get prediction from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (id, label, placeholder, field, type = "number") => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Input
        id={id}
        type={type}
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="h-11"
      />
    </div>
  );

  const renderSelect = (id, label, placeholder, field, options) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Select value={formData[field]} onValueChange={(value) => updateField(field, value)}>
        <SelectTrigger id={id} className="h-11">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
              {typeof opt === "string" ? opt : opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center relative">
          <div className="absolute right-0 top-0">
            <BatchPredictDialog />
          </div>
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Employee Attrition Prediction</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter key employee data points to quickly predict attrition risk using our ML model.
          </p>
        </div>

        {/* Input Mode Selection */}
        <Card className="p-6 card-shadow">
          <Tabs value={inputMode} onValueChange={setInputMode}>
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12">
              <TabsTrigger value="dropdown" className="text-sm font-medium">Select Employee</TabsTrigger>
              <TabsTrigger value="manual" className="text-sm font-medium">Manual Input</TabsTrigger>
              <TabsTrigger value="simulator" className="text-sm font-medium text-blue-500 font-semibold flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> What-If Simulator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dropdown" className="mt-6">
              <div className="max-w-md mx-auto">
                <Label className="text-sm font-medium mb-2 block">Choose an existing employee</Label>
                <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select an employee to auto-fill data" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map((emp) => (
                      <SelectItem key={emp._id || emp.id} value={(emp._id || emp.id).toString()}>
                        {emp.name} - {emp.jobRole || emp.role} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-6">
              <p className="text-center text-muted-foreground">
                Fill in the employee details below to get an accurate prediction.
              </p>
            </TabsContent>

            <TabsContent value="simulator" className="mt-6 space-y-6">
              <div className="max-w-md mx-auto mb-4">
                <Label className="text-sm font-medium mb-2 block">Target Employee for Simulation</Label>
                <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select an employee or use current profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map((emp) => (
                      <SelectItem key={emp._id || emp.id} value={(emp._id || emp.id).toString()}>
                        {emp.name} - {emp.jobRole || emp.role} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <RetentionSimulator employeeData={formData} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Form Sections (Only shown when not in simulator mode) */}
        {inputMode !== "simulator" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Profile Section */}
              <PredictionFormSection title="Employee Profile" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    {renderInput("email", "Email Address", "employee@company.com", "email", "email")}
                  </div>
                  {renderInput("age", "Age", "35", "age")}
                  {renderSelect("department", "Department", "Select dept", "department", departments)}
                  {renderSelect("jobRole", "Job Role", "Select role", "jobRole", jobRoles)}
                  {renderSelect("overTime", "Overtime", "Works overtime?", "overTime", overtimeOptions)}
                </div>
              </PredictionFormSection>

              {/* Compensation Section */}
              <PredictionFormSection title="Compensation & Benefits" icon={DollarSign}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput("monthlyIncome", "Monthly Income ($)", "5000", "monthlyIncome")}
                  {renderInput("percentSalaryHike", "Salary Hike (%)", "15", "percentSalaryHike")}
                  <div className="col-span-2">
                    {renderSelect("stockOptionLevel", "Stock Option Level", "Select level", "stockOptionLevel", stockOptionLevels)}
                  </div>
                </div>
              </PredictionFormSection>

              {/* Experience & Logistics Section */}
              <PredictionFormSection title="Tenure & Logistics" icon={Clock}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput("yearsAtCompany", "Years at Company", "5", "yearsAtCompany")}
                  {renderInput("yearsSinceLastPromotion", "Years Since Promotion", "2", "yearsSinceLastPromotion")}
                  <div className="col-span-2">
                    {renderInput("distanceFromHome", "Distance from Home (miles)", "10", "distanceFromHome")}
                  </div>
                </div>
              </PredictionFormSection>

              {/* Satisfaction Section */}
              <PredictionFormSection title="Satisfaction & Wellness" icon={Heart}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect("environmentSatisfaction", "Env. Satisfaction", "Select level", "environmentSatisfaction", satisfactionLevels)}
                  {renderSelect("jobSatisfaction", "Job Satisfaction", "Select level", "jobSatisfaction", satisfactionLevels)}
                  <div className="col-span-2">
                    {renderSelect("workLifeBalance", "Work-Life Balance", "Select level", "workLifeBalance", satisfactionLevels)}
                  </div>
                </div>
              </PredictionFormSection>
            </div>

            {/* Predict Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="h-14 px-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                onClick={handlePredict}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Predict Attrition Risk
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Prediction Result Dialog */}
        <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
          <DialogContent className="sm:max-w-2xl p-0 border-none bg-transparent shadow-none max-h-[90vh] overflow-y-auto">
            {prediction && (
              <PredictionResult prediction={prediction} formData={formData} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default Predict;
