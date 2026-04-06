
import { useState, useEffect } from "react";
import { Users, Target, Smile } from "lucide-react";
import Layout from "@/components/layout/Layout.jsx";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { UpgradeCard } from "@/components/shared/UpgradeCard.jsx";
import { AttritionTrendChart } from "@/components/dashboard/AttritionTrendChart.jsx";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart.jsx";
import { ActionRecorder } from "@/components/dashboard/ActionRecorder.jsx";
import { HighRiskEmployees } from "@/components/shared/HighRiskEmployees.jsx";
import { HighRiskFactorsCard } from "@/components/dashboard/HighRiskFactorsCard.jsx";
import { MailingManagement } from "@/components/dashboard/MailingManagement.jsx";
import {
  highRiskFactors as mockHighRiskFactors,
} from "@/data/mockData";
import { getDashboardStats, getActionLogs, getRecommendations } from "@/services/api";

export function Dashboard() {
  const [stats, setStats] = useState({
    dashboardStats: { totalEmployees: 0, attritionRate: 0, employeeSatisfaction: 0 },
    departmentPieData: [],
    attritionTrendData: [],
    highRiskEmployees: [],
    highRiskFactors: [],
  });
  const [actions, setActions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, logsData, recsData] = await Promise.all([
          getDashboardStats(timeRange),
          getActionLogs(),
          getRecommendations()
      ]);
      setStats(statsData);
      setActions(logsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const refreshActions = async () => {
    try {
      const logsData = await getActionLogs();
      setActions(logsData);
    } catch (error) {
      console.error("Failed to refresh actions", error);
    }
  };

  const { dashboardStats, attritionTrendData, departmentPieData, highRiskEmployees, highRiskFactors } = stats;

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Top Row - Welcome + Stats */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-5">
              <WelcomeBanner userName="Admin" date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
            </div>
            <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                icon={<Users className="h-6 w-6 text-blue-500" />}
                value={loading ? "..." : dashboardStats.totalEmployees.toLocaleString()}
                label="Total Employees"
                iconBgClass="bg-blue-500/10"
                accentColor="from-blue-500 to-cyan-400"
              />
              <StatsCard
                icon={<Target className="h-6 w-6 text-rose-500" />}
                value={loading ? "..." : `${dashboardStats.attritionRate}%`}
                label="Attrition Rate"
                iconBgClass="bg-rose-500/10"
                accentColor="from-rose-500 to-orange-400"
              />
              <StatsCard
                icon={<Smile className="h-6 w-6 text-emerald-500" />}
                value={loading ? "..." : `${dashboardStats.employeeSatisfaction}%`}
                label="Employee Satisfaction"
                iconBgClass="bg-emerald-500/10"
                accentColor="from-emerald-500 to-teal-400"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <AttritionTrendChart
                data={attritionTrendData}
                period={timeRange}
                onPeriodChange={setTimeRange}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <DepartmentChart
                barData={departmentPieData}
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4">
              <HighRiskEmployees employees={highRiskEmployees} onActionLogged={refreshActions} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <HighRiskFactorsCard data={highRiskFactors && highRiskFactors.length > 0 ? highRiskFactors : []} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <MailingManagement employees={highRiskEmployees} onActionLogged={refreshActions} />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <UpgradeCard />
          <ActionRecorder history={actions} />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
