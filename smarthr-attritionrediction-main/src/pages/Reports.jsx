import Layout from "@/components/layout/Layout.jsx";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards.jsx";
import { GradientAreaChart } from "@/components/reports/GradientAreaChart.jsx";
import { RadarAnalysisChart } from "@/components/reports/RadarAnalysisChart.jsx";
import { DepartmentRiskTable } from "@/components/reports/DepartmentRiskTable.jsx";

// ... (existing imports)



// ... (existing imports)

import { EnhancedDonutChart } from "@/components/reports/EnhancedDonutChart.jsx";
import { HorizontalBarChart } from "@/components/reports/HorizontalBarChart.jsx";
import { ComparisonCards } from "@/components/reports/ComparisonCards.jsx";
import { JobRoleBarChart } from "@/components/reports/JobRoleBarChart.jsx";
import { TenureSplineChart } from "@/components/reports/TenureSplineChart.jsx";
import { OvertimeComparison } from "@/components/reports/OvertimeComparison.jsx";
import { FeatureImportance } from "@/components/dashboard/FeatureImportance.jsx";
import { PrintableReport } from "@/components/reports/PrintableReport.jsx";
import { HighRiskEmployees } from "@/components/shared/HighRiskEmployees.jsx";
import { useState, useEffect } from "react";

import { featureImportance } from "@/data/mockData";
import { getReportsData, getHighRiskEmployees } from "@/services/api";

export function Reports() {
  const [data, setData] = useState({
    reportSummary: {
      overallAttritionRate: 0,
      highRiskEmployees: 0,
      attritionCount: 0,
      avgTenure: 0
    },
    attritionByDepartment: [],
    attritionByJobRole: [],
    attritionByAgeGroup: [],
    attritionByIncome: [],
    attritionByGender: [],
    attritionByEducation: [],
    attritionByMaritalStatus: [],
    attritionByJobLevel: [],
    attritionByWorkEnvironment: [],
    attritionByYearsAtCompany: [],
    attritionByOvertime: [],
    attritionByPerformance: [],
    attritionByJobSatisfaction: [],
    featureImportance: []
  });
  const [highRiskEmployees, setHighRiskEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Find the printable container we want to capture
      const container = document.getElementById("printable-report-container");
      if (!container) return;

      const pages = container.querySelectorAll(".pdf-page");
      if (!pages || pages.length === 0) return;

      // Extremely important: wait for all Recharts SVG animations to completely finish!
      await new Promise(resolve => setTimeout(resolve, 1500));

      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        // Render each page precisely
        const canvas = await html2canvas(pages[i], { 
          scale: 3, // 3x scale guarantees crisp text and sharp lines in final PDF
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Extrapolate perfectly to A4
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save("RetainIQ_Professional_Report.pdf");
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportData, highRisk] = await Promise.all([
          getReportsData(),
          getHighRiskEmployees()
        ]);
        // Normalize backend names to frontend expected names
        const normalizedData = {
          ...reportData,
          reportSummary: {
            ...reportData.reportSummary,
            overallAttritionRate: reportData.reportSummary.overallAttritionRate || reportData.reportSummary.avgAttritionRate || 0,
            highRiskEmployees: reportData.reportSummary.highRiskEmployees || reportData.reportSummary.highRiskCount || 0,
            attritionCount: reportData.reportSummary.attritionCount || Math.round((reportData.reportSummary.totalEmployees || 1470) * ((reportData.reportSummary.overallAttritionRate || 10) / 100)),
            avgTenure: reportData.reportSummary.avgTenure || 6.5
          }
        };
        setData(normalizedData);
        setHighRiskEmployees(highRisk);
      } catch (error) {
        console.error("Failed to load reports data", error);
        if (error.response && error.response.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const {
    reportSummary,
    attritionByDepartment,
    attritionByJobRole,
    attritionByAgeGroup,
    attritionByIncome,
    attritionByGender,
    attritionByEducation,
    attritionByMaritalStatus,
    attritionByJobLevel,
    attritionByWorkEnvironment,
    attritionByYearsAtCompany,
    attritionByOvertime,
    attritionByPerformance,
    attritionByJobSatisfaction
  } = data;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">Loading reports...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="report-content" className="space-y-8 bg-background p-4 rounded-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attrition Analysis Reports</h1>
            <p className="text-base text-muted-foreground mt-2">
              Comprehensive attrition insights by employee attributes and prediction factors.
            </p>
          </div>
          <Button onClick={exportToPDF} disabled={isExporting} className="shrink-0 gap-2 shadow-sm">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? "Generating PDF..." : "Export as PDF"}
          </Button>
        </div>

        {/* Summary Cards */}
        <ReportSummaryCards summary={reportSummary} />

        {/* Tabs for different attribute categories */}
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="mb-6 h-12 p-1">
            <TabsTrigger value="demographics" className="text-sm px-6 h-10">Demographics</TabsTrigger>
            <TabsTrigger value="job-metrics" className="text-sm px-6 h-10">Job Metrics</TabsTrigger>
            <TabsTrigger value="ml-features" className="text-sm px-6 h-10">ML Model Features</TabsTrigger>
          </TabsList>

          {/* ML Model Features Tab */}
          <TabsContent value="ml-features" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <ComparisonCards
                  title="Attrition by Performance"
                  data={attritionByPerformance}
                  nameKey="label"
                  dataKey="attritionRate"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <OvertimeComparison data={attritionByOvertime} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <JobRoleBarChart
                  title="Attrition by Job Role"
                  data={attritionByJobRole}
                  nameKey="label"
                  dataKey="attritionRate"
                  subtitle="Sales roles show highest turnover risk"
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <FeatureImportance data={data.featureImportance?.length > 0 ? data.featureImportance : featureImportance} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <GradientAreaChart
                  title="Attrition by Monthly Income"
                  data={attritionByIncome}
                  dataKeyX="label"
                  dataKeyY="attritionRate"
                  subtitle="Higher income correlates with lower attrition"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <TenureSplineChart
                  title="Attrition by Tenure"
                  data={attritionByYearsAtCompany}
                  nameKey="label"
                  dataKey="attritionRate"
                  subtitle="New employees have highest attrition risk"
                />
              </div>
            </div>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <GradientAreaChart
                  title="Attrition by Age Group"
                  data={attritionByAgeGroup}
                  dataKeyX="label"
                  dataKeyY="attritionRate"
                  subtitle="Younger employees show higher turnover"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <ComparisonCards
                  title="Attrition by Gender"
                  data={attritionByGender}
                  nameKey="label"
                  dataKey="attritionRate"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <HorizontalBarChart
                  title="Attrition by Education Level"
                  data={attritionByEducation}
                  nameKey="label"
                  valueKey="attritionRate"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <EnhancedDonutChart
                  title="Attrition by Marital Status"
                  data={attritionByMaritalStatus}
                  nameKey="label"
                  dataKey="attritionRate"
                  centerLabel="Attrition"
                />
              </div>
            </div>
          </TabsContent>

          {/* Job Metrics Tab */}
          <TabsContent value="job-metrics" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <DepartmentRiskTable
                  title="Department Risk Analysis"
                  data={attritionByDepartment}
                  subtitle="Detailed breakdown of attrition by department"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <JobRoleBarChart
                  title="Attrition by Job Level"
                  data={attritionByJobLevel}
                  nameKey="level"
                  dataKey="attritionRate"
                  subtitle="Entry-level has the highest turnover"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
                <RadarAnalysisChart
                  title="Attrition by Performance Rating"
                  data={attritionByPerformance}
                  nameKey="rating"
                  dataKey="attritionRate"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <ComparisonCards
                  title="Attrition by Job Satisfaction"
                  data={attritionByJobSatisfaction}
                  nameKey="label"
                  dataKey="attritionRate"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden Printable Report for PDF Generation */}
        <div className="absolute top-[0px] left-[-9999px] w-[794px] bg-white pointer-events-none z-[-100]">
          <div id="printable-report-container">
            <PrintableReport 
              data={data} 
              highRiskEmployees={highRiskEmployees} 
              hrUser={{ name: "System Administrator", role: "HR Operations" }} 
            />
          </div>
        </div>

        {/* Visible High-Risk Employees List Section */}
        <div className="pt-10 border-t mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Highest Risk Employees</h2>
            <p className="text-sm text-muted-foreground mt-1">Detailed list of active employees prioritised by AI prediction scores.</p>
          </div>
          <HighRiskEmployees employees={highRiskEmployees} isDialog={false} />
        </div>

      </div>
    </Layout>
  );
}

export default Reports;
