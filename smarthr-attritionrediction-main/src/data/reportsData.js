// Reports Page Data - Attrition Analysis by Various Attributes
// This file contains analytical data for the Reports page

// ML Model Feature Analysis - Attrition by key prediction features
export const attritionByWorkEnvironment = [
  { level: "Poor", attritionRate: 42, employees: 120 },
  { level: "Fair", attritionRate: 28, employees: 340 },
  { level: "Good", attritionRate: 18, employees: 520 },
  { level: "Excellent", attritionRate: 8, employees: 262 },
];

export const attritionByJobRole = [
  { role: "Sales Representative", attritionRate: 40, employees: 83 },
  { role: "Laboratory Technician", attritionRate: 35, employees: 62 },
  { role: "Human Resources", attritionRate: 30, employees: 52 },
  { role: "Research Scientist", attritionRate: 22, employees: 92 },
  { role: "Sales Executive", attritionRate: 18, employees: 326 },
  { role: "Manufacturing Director", attritionRate: 12, employees: 145 },
  { role: "Healthcare Representative", attritionRate: 10, employees: 131 },
  { role: "Manager", attritionRate: 8, employees: 102 },
  { role: "Research Director", attritionRate: 5, employees: 80 },
];

export const attritionByIncome = [
  { range: "<$30K", attritionRate: 45, employees: 89 },
  { range: "$30K-$50K", attritionRate: 32, employees: 245 },
  { range: "$50K-$70K", attritionRate: 22, employees: 386 },
  { range: "$70K-$90K", attritionRate: 15, employees: 312 },
  { range: "$90K-$110K", attritionRate: 10, employees: 142 },
  { range: ">$110K", attritionRate: 6, employees: 68 },
];

export const attritionByYearsAtCompany = [
  { years: "0-1", attritionRate: 38, employees: 156 },
  { years: "1-2", attritionRate: 32, employees: 198 },
  { years: "2-5", attritionRate: 20, employees: 387 },
  { years: "5-10", attritionRate: 12, employees: 298 },
  { years: "10-20", attritionRate: 8, employees: 145 },
  { years: "20+", attritionRate: 4, employees: 58 },
];

export const attritionByOvertime = [
  { status: "Yes", attritionRate: 35, employees: 416 },
  { status: "No", attritionRate: 12, employees: 826 },
];

// Demographics Analysis
export const attritionByAgeGroup = [
  { group: "18-25", attritionRate: 38, employees: 145 },
  { group: "26-35", attritionRate: 24, employees: 512 },
  { group: "36-45", attritionRate: 16, employees: 358 },
  { group: "46-55", attritionRate: 12, employees: 178 },
  { group: "55+", attritionRate: 8, employees: 49 },
];

export const attritionByGender = [
  { gender: "Male", attritionRate: 17, employees: 882 },
  { gender: "Female", attritionRate: 15, employees: 588 },
];

export const attritionByEducation = [
  { level: "Below College", attritionRate: 28, employees: 170 },
  { level: "College", attritionRate: 22, employees: 282 },
  { level: "Bachelor", attritionRate: 18, employees: 572 },
  { level: "Master", attritionRate: 14, employees: 398 },
  { level: "Doctor", attritionRate: 10, employees: 48 },
];

export const attritionByMaritalStatus = [
  { status: "Single", attritionRate: 25, employees: 470 },
  { status: "Married", attritionRate: 13, employees: 673 },
  { status: "Divorced", attritionRate: 20, employees: 327 },
];

// Job Metrics Analysis
export const attritionByDepartment = [
  { department: "Sales", attritionRate: 28, employees: 446 },
  { department: "R&D", attritionRate: 14, employees: 961 },
  { department: "HR", attritionRate: 18, employees: 63 },
];

export const attritionByJobLevel = [
  { level: "Entry (1)", attritionRate: 32, employees: 543 },
  { level: "Junior (2)", attritionRate: 22, employees: 534 },
  { level: "Mid (3)", attritionRate: 15, employees: 218 },
  { level: "Senior (4)", attritionRate: 8, employees: 106 },
  { level: "Executive (5)", attritionRate: 5, employees: 69 },
];

export const attritionByPerformance = [
  { rating: "Low (1-2)", attritionRate: 28, employees: 226 },
  { rating: "Average (3)", attritionRate: 18, employees: 678 },
  { rating: "High (4-5)", attritionRate: 12, employees: 566 },
];

export const attritionByJobSatisfaction = [
  { level: "Low", attritionRate: 35, employees: 289 },
  { level: "Medium", attritionRate: 22, employees: 280 },
  { level: "High", attritionRate: 14, employees: 442 },
  { level: "Very High", attritionRate: 8, employees: 459 },
];

// Summary Statistics
export const reportSummary = {
  overallAttritionRate: 16.1,
  highRiskEmployees: 187,
  avgTenure: 7.0,
  avgSatisfaction: 2.7,
  totalEmployees: 1470,
  attritionCount: 237,
};
