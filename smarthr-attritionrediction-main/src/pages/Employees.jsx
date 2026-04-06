import { useState, useEffect } from "react";
import { ChevronDown, Loader2, Download } from "lucide-react";
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
import { departments, actionHistory } from "@/data/mockData";
import { getEmployees } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [idRange, setIdRange] = useState("1-100");
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        // Backend returns { total, page, limit, employees: [...] }
        setEmployeeList(response.employees || []);
      } catch (error) {
        console.error("Failed to fetch employees", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employees. Please try again.",
        });
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [toast, navigate]);

  const handleEmployeeAdded = (newEmployee) => {
    // Ideally, we should re-fetch or add the new employee returned from API
    // For now, let's just add it to the local state if it matches the structure
    setEmployeeList((prev) => [...prev, newEmployee]);
  };

  const filteredEmployees = employeeList.filter((employee) => {
    const name = employee.name ? employee.name.toString().toLowerCase() : "";
    const role = employee.jobRole ? employee.jobRole.toString().toLowerCase() : "";
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      role.includes(search);
    const matchesFilter =
      activeFilter === "All" || employee.department === activeFilter;
      
    let matchesRange = true;
    if (idRange !== "All") {
      const [startStr, endStr] = idRange.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const empId = employee.id || parseInt(employee._id, 10) || 0;
      matchesRange = empId >= start && empId <= end;
    }

    return matchesSearch && matchesFilter && matchesRange;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, idRange]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const exportToCSV = () => {
    const csvData = filteredEmployees.map(emp => ({
      ID: emp._id || emp.id,
      Name: emp.name || "N/A",
      JobRole: emp.jobRole || "N/A",
      Department: emp.department || "N/A",
      Age: emp.age || "N/A",
      MonthlyIncome: emp.monthlyIncome || emp.income || "N/A",
      YearsAtCompany: emp.yearsAtCompany || "N/A",
      JobSatisfaction: emp.jobSatisfaction || "N/A",
      PerformanceRating: emp.performanceRating || "N/A",
      RiskScore: emp.riskScore || "N/A"
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "Employees_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Export Successful",
      description: `Exported ${filteredEmployees.length} employee records to CSV.`,
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">
              Manage and view your employee records.
            </p>
          </div>

          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search employees..."
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <AddEmployeeDialog onEmployeeAdded={handleEmployeeAdded} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-1">Department:</span>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={activeFilter === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(dept)}
                  className={
                    activeFilter === dept
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }
                >
                  {dept}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-1">Range:</span>
              {["1-100", "101-250", "251-500", "501-1000", "1001-1470", "All"].map((range) => (
                <Button
                  key={range}
                  variant={idRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIdRange(range)}
                  className={
                    idRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Card className="card-shadow overflow-hidden">
            <ScrollArea className="h-[660px] w-full rounded-md">
              <div className="overflow-x-auto min-w-[800px]">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8 h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <table className="w-full relative">
                    <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-20">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Name ↓
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Role
                        </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Age
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Income
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Years at Company
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-muted-foreground">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((employee, index) => {
                        const employeeId = employee._id || employee.id;
                        
                        return (
                          <tr
                            key={`${employeeId}-${index}`}
                            onClick={() => handleRowClick(employee)}
                            className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                          >
                            <td className="py-4 px-4 text-sm text-foreground font-medium">
                              {employee._id 
                                ? `#${employee._id.substring(employee._id.length - 6).toUpperCase()}` 
                                : `#EMP${String(employee.id).padStart(3, '0')}`}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                    {employee.name
                                      ? employee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                      : "NA"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {employee.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {employee.jobRole}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-foreground">
                              {employee.jobRole}
                            </td>
                            <td className="py-4 px-4 text-sm text-foreground">
                              {employee.department}
                            </td>
                            <td className="py-4 px-4 text-sm text-foreground">
                              {employee.age}
                            </td>
                            <td className="py-4 px-4 text-sm text-foreground">
                              ${employee.monthlyIncome ? employee.monthlyIncome.toLocaleString() : 0}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground">
                                  {employee.yearsAtCompany}
                                </span>
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-primary font-bold">→</span>
                                </div>
                              </div>
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
            {!isLoading && totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-card">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Employee Details Dialog popup */}
        <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
          <DialogContent className="sm:max-w-[700px] border-border bg-card">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between mt-2">
                <DialogTitle className="text-xl">Details for {selectedEmployee?.name || "Employee"}</DialogTitle>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mr-4">
                  Risk Score: {selectedEmployee?.riskScore || "N/A"}
                </span>
              </div>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="py-4 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-border pb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedEmployee.name}</h2>
                    <p className="text-muted-foreground text-sm font-medium">{selectedEmployee.jobRole} • {selectedEmployee.department}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-muted-foreground text-xs">
                        ID: {selectedEmployee._id ? `#${selectedEmployee._id.substring(selectedEmployee._id.length - 6).toUpperCase()}` : `#EMP${String(selectedEmployee.id).padStart(3, '0')}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Email: {selectedEmployee.email || `${selectedEmployee.name?.split(' ').join('.').toLowerCase()}@company.com`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Age</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.age || "N/A"} years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Monthly Income</p>
                    <p className="text-sm font-medium text-foreground">${selectedEmployee.monthlyIncome?.toLocaleString() || selectedEmployee.income?.toLocaleString() || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tenure</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.yearsAtCompany || "N/A"} years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Job Satisfaction</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.jobSatisfaction || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Performance Rating</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.performanceRating || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Overtime</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.overtime || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border mt-2 gap-3">
                  <Button variant="outline" onClick={() => setSelectedEmployee(null)}>Close</Button>
                  <Button>View Full Profile</Button>
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
