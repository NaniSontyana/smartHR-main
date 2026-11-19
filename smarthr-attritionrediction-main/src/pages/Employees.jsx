import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Loader2, Download, Upload, Users, ShieldAlert, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";
import Layout from "@/components/layout/Layout.jsx";
import { SearchInput } from "@/components/shared/SearchInput.jsx";
import { UpgradeCard } from "@/components/shared/UpgradeCard.jsx";
import { ActionRecorder } from "@/components/dashboard/ActionRecorder.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog.jsx";
import { getEmployees, bulkAddEmployees, getActionLogs } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("All");
  const [activeRiskFilter, setActiveRiskFilter] = useState("All");
  const [employeeList, setEmployeeList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchEmployeesData = useCallback(async (page = 1, search = searchQuery, dept = activeDepartment, risk = activeRiskFilter) => {
    setIsLoading(true);
    try {
      const response = await getEmployees({
        page,
        limit: 20,
        search,
        department: dept,
        attritionRisk: risk
      });

      setEmployeeList(response.employees || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || 1);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      toast({
        variant: "destructive",
        title: "Error fetching directory",
        description: error.response?.data?.message || "Failed to communicate with database.",
      });
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeDepartment, activeRiskFilter, toast, navigate]);

  // Load audit actions and initial employee list
  useEffect(() => {
    fetchEmployeesData(1, searchQuery, activeDepartment, activeRiskFilter);
  }, [activeDepartment, activeRiskFilter, fetchEmployeesData]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEmployeesData(1, searchQuery, activeDepartment, activeRiskFilter);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchEmployeesData, activeDepartment, activeRiskFilter]);

  // Load audit trail
  useEffect(() => {
    getActionLogs().then(logs => setActionHistory(logs || [])).catch(() => {});
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchEmployeesData(newPage, searchQuery, activeDepartment, activeRiskFilter);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error("CSV file contains no data rows.");
          }
          const response = await bulkAddEmployees(results.data);
          toast({
            title: "Workforce Imported Successfully",
            description: `Imported ${response.inserted || results.data.length} new employees into database.`
          });
          fetchEmployeesData(1);
        } catch (err) {
          console.error("Bulk upload error:", err);
          toast({
            variant: "destructive",
            title: "CSV Import Failed",
            description: err.response?.data?.message || err.message || "Failed to parse CSV file."
          });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (parseError) => {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "CSV Parse Error",
          description: parseError.message
        });
      }
    });
  };

  const exportToCSV = () => {
    if (employeeList.length === 0) {
      toast({ title: "No records to export" });
      return;
    }

    const csvData = employeeList.map(emp => ({
      ID: emp.employeeId || emp._id,
      Name: emp.name || "N/A",
      JobRole: emp.jobRole || "N/A",
      Department: emp.department || "N/A",
      Age: emp.age || "N/A",
      MonthlyIncome: emp.monthlyIncome || "N/A",
      YearsAtCompany: emp.yearsAtCompany || "N/A",
      JobSatisfaction: emp.jobSatisfaction || "N/A",
      PerformanceRating: emp.performanceRating || "N/A",
      RiskLevel: emp.riskLevel || "Low",
      RiskScore: emp.riskScore || 0
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `Workforce_Directory_P${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Completed",
      description: `Exported ${employeeList.length} employee records.`
    });
  };

  const departments = ["All", "Research & Development", "Sales", "Human Resources"];
  const riskFilters = ["All", "High", "Medium", "Low"];

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main Directory Table */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
              <p className="text-muted-foreground text-sm">
                Managing {totalCount.toLocaleString()} total organization members
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? "Importing..." : "Import CSV"}
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <AddEmployeeDialog onEmployeeAdded={() => fetchEmployeesData(1)} />
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, ID, job role, or email..."
              className="flex-1"
            />
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Dept:</span>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={activeDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveDepartment(dept)}
                  className="text-xs h-8"
                >
                  {dept}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Risk:</span>
              {riskFilters.map((r) => (
                <Button
                  key={r}
                  variant={activeRiskFilter === r ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveRiskFilter(r)}
                  className="text-xs h-7 px-2.5"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <Card className="card-shadow overflow-hidden">
            <ScrollArea className="h-[600px] w-full rounded-md">
              <div className="overflow-x-auto min-w-[800px]">
                {isLoading ? (
                  <div className="flex justify-center items-center p-16 h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <table className="w-full relative">
                    <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground w-28 uppercase">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Employee</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Tenure</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Salary</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Attrition Risk</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-16 text-muted-foreground">
                            No employees found matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        employeeList.map((employee, index) => {
                          const empId = employee.employeeId || employee._id;
                          const riskBadgeColor = 
                            employee.riskLevel === "High" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            employee.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

                          return (
                            <tr
                              key={`${empId}-${index}`}
                              onClick={() => setSelectedEmployee(employee)}
                              className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                              <td className="py-3.5 px-4 text-xs text-foreground font-mono font-medium">
                                #{empId}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                      {employee.name ? employee.name.split(" ").map((n) => n[0]).join("") : "EM"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{employee.name}</p>
                                    <p className="text-xs text-muted-foreground">{employee.jobRole}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-foreground">
                                {employee.department}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-foreground">
                                {employee.yearsAtCompany ?? "N/A"} yrs
                              </td>
                              <td className="py-3.5 px-4 text-xs text-foreground font-medium">
                                ${employee.monthlyIncome ? employee.monthlyIncome.toLocaleString() : "—"}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${riskBadgeColor}`}>
                                  {employee.riskLevel || "Low"} ({employee.riskScore || 0}%)
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="text-xs text-primary font-medium group-hover:underline">View Details →</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </ScrollArea>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-card">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} records
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Employee Details Dialog */}
        <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
          <DialogContent className="sm:max-w-[650px] border-border bg-card">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between mt-2">
                <DialogTitle className="text-lg">Employee Evaluation Profile</DialogTitle>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium mr-4 border ${
                  selectedEmployee?.riskLevel === "High" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  selectedEmployee?.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  Risk Score: {selectedEmployee?.riskScore || 0}% ({selectedEmployee?.riskLevel || "Low"})
                </span>
              </div>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="py-4 flex flex-col gap-5">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {selectedEmployee.name?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedEmployee.name}</h2>
                    <p className="text-muted-foreground text-xs font-medium">{selectedEmployee.jobRole} • {selectedEmployee.department}</p>
                    <p className="text-muted-foreground text-xs mt-1">ID: #{selectedEmployee.employeeId || selectedEmployee._id} • {selectedEmployee.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Age</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedEmployee.age || "—"} yrs</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Monthly Income</p>
                    <p className="text-sm font-semibold mt-0.5">${selectedEmployee.monthlyIncome?.toLocaleString() || "—"}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Tenure at Company</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedEmployee.yearsAtCompany ?? "—"} yrs</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Job Satisfaction</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedEmployee.jobSatisfaction || "—"}/4</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Work-Life Balance</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedEmployee.workLifeBalance || "—"}/4</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-muted-foreground uppercase text-[10px] font-semibold">Overtime Commitment</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedEmployee.overtime || "No"}</p>
                  </div>
                </div>

                {selectedEmployee.factors && selectedEmployee.factors.length > 0 && (
                  <div className="border border-border/80 rounded-lg p-3 bg-muted/20">
                    <p className="text-xs font-semibold mb-2 text-foreground">Model Attribution Indicators:</p>
                    <div className="space-y-1.5">
                      {selectedEmployee.factors.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{f.name}</span>
                          <span className="font-semibold text-primary">+{f.impact}% hazard</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-2 border-t border-border gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(null)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <UpgradeCard />
          <ActionRecorder history={actionHistory} />
        </div>
      </div>
    </Layout>
  );
}

export default Employees;
