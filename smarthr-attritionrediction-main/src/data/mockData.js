// Mock data for HRMate - Employee Attrition Prediction Dashboard
// This file contains sample data that can be replaced with real API calls

export const employees = [
  {
    id: 1,
    name: "John Doe",
    role: "Software Engineer",
    department: "Research & Development",
    age: 35,
    income: 85000,
    yearsAtCompany: 5,
    riskScore: 86,
    avatar: null,
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Sales Executive",
    department: "Sales",
    age: 29,
    income: 75000,
    yearsAtCompany: 3,
    riskScore: 79,
    avatar: null,
  },
  {
    id: 3,
    name: "Michael Johnson",
    role: "HR Specialist",
    department: "Human Resources",
    age: 41,
    income: 70000,
    yearsAtCompany: 4,
    riskScore: 74,
    avatar: null,
  },
  {
    id: 4,
    name: "Emma Brown",
    role: "Marketing Specialist",
    department: "Sales",
    age: 32,
    income: 68000,
    yearsAtCompany: 2,
    riskScore: 72,
    avatar: null,
  },
  {
    id: 5,
    name: "David Wilson",
    role: "Data Scientist",
    department: "Research & Development",
    age: 37,
    income: 95000,
    yearsAtCompany: 6,
    riskScore: 45,
    avatar: null,
  },
  {
    id: 6,
    name: "Sarah Lee",
    role: "HR Analyst",
    department: "Human Resources",
    age: 36,
    income: 60000,
    yearsAtCompany: 5,
    riskScore: 72,
    avatar: null,
  },
];

export const dashboardStats = {
  totalEmployees: 1242,
  attritionRate: 24,
  employeeSatisfaction: 82,
};

export const attritionTrendData = [
  { month: "Jan", value: 8 },
  { month: "Feb", value: 10 },
  { month: "Mar", value: 9 },
  { month: "Apr", value: 12 },
  { month: "May", value: 15 },
  { month: "Jun", value: 18 },
  { month: "Jul", value: 23.7 },
  { month: "Aug", value: 20 },
  { month: "Sep", value: 17 },
  { month: "Oct", value: 15 },
  { month: "Nov", value: 12 },
  { month: "Dec", value: 10 },
];

export const departmentAttritionData = [
  { department: "Sales", onTime: 89, late: 8, absent: 3 },
  { department: "Research & Development", onTime: 79, late: 15, absent: 6 },
  { department: "Research & Development", onTime: 79, late: 12, absent: 9 },
  { department: "Human Resources", onTime: 85, late: 10, absent: 5 },
];

export const departmentPieData = [
  { name: "Sales", value: 38, color: "hsl(var(--chart-coral))" },
  { name: "Research & Development", value: 24, color: "hsl(var(--chart-peach))" },
  { name: "Human Resources", value: 25, color: "hsl(var(--chart-blue))" },
];

export const featureImportance = [
  { feature: "Work Environment", importance: 30 },
  { feature: "Job Role", importance: 25 },
  { feature: "Monthly Income", importance: 20 },
  { feature: "Years at Company", importance: 15 },
  { feature: "OverTime", importance: 10 },
];

export const highRiskFactors = [
  { factor: "Work Environment", department: "Research & Development", percentage: 30 },
  { factor: "Job Role", department: "Sales", percentage: 25 },
  { factor: "Monthly Income", department: "Human Resources", percentage: 20 },
  { factor: "Years at Company", department: "Sales", percentage: 15 },
];

export const actionRecommendations = [
  {
    type: "high",
    title: "Schedule 1-on-1s in R&D",
    description: "Work Environment is a critical factor for 30% of high-risk engineers.",
    actionText: "Review Feedback"
  },
  {
    type: "medium",
    title: "Review Sales Compensation",
    description: "Reassess base pay vs commission limits. Job Role dissatisfaction is up 25%.",
    actionText: "Analyze Pay"
  },
  {
    type: "low",
    title: "Tenure Milestone Check-ins",
    description: "Implement 3-year anniversary bonuses to retain long-term Sales staff.",
    actionText: "Set Reminder"
  }
];

export const actionHistory = [
  {
    id: 1,
    date: "Today, 10:30 AM",
    title: "Sent Survey to Sales Team",
    description: "Distributed anonymous 'Work Environment' feedback form to 45 employees.",
    user: "Admin",
    type: "communication",
  },
  {
    id: 2,
    date: "Yesterday",
    title: "Approved Retention Bonus",
    description: "Approved a 5% off-cycle adjustment for Michael Chang.",
    user: "Admin",
    type: "compensation",
  },
  {
    id: 3,
    date: "Feb 8, 2026",
    title: "1-on-1: Sarah Jenkins",
    description: "Discussed career trajectory and current project constraints.",
    user: "Admin",
    type: "meeting",
  },
  {
    id: 4,
    date: "Feb 5, 2026",
    title: "Batch Prediction Run",
    description: "System processed 1,242 employee profiles. Identified 3 new critical risks.",
    user: "System",
    type: "system",
  }
];

export const departments = ["All", "Sales", "Research & Development", "Human Resources"];

export const roles = [
  "Software Engineer",
  "Sales Executive",
  "HR Specialist",
  "Marketing Specialist",
  "Data Scientist",
  "HR Analyst",
  "Product Manager",
  "Business Analyst",
];
