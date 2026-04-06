// Options for prediction form dropdowns

export const departments = ["Sales", "Research & Development", "Human Resources"];

export const jobRoles = [
  "Sales Executive",
  "Research Scientist",
  "Laboratory Technician",
  "Manufacturing Director",
  "Healthcare Representative",
  "Manager",
  "Sales Representative",
  "Research Director",
  "Human Resources",
];

export const educationFields = [
  "Life Sciences",
  "Medical",
  "Marketing",
  "Technical Degree",
  "Human Resources",
  "Other",
];

export const businessTravelOptions = [
  { value: "Non-Travel", label: "Non-Travel" },
  { value: "Travel_Rarely", label: "Travel Rarely" },
  { value: "Travel_Frequently", label: "Travel Frequently" },
];

export const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
];

export const overtimeOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

// 1-4 scale options
export const satisfactionLevels = [
  { value: "1", label: "1 - Low" },
  { value: "2", label: "2 - Medium" },
  { value: "3", label: "3 - High" },
  { value: "4", label: "4 - Very High" },
];

// Education levels
export const educationLevels = [
  { value: "1", label: "1 - Below College" },
  { value: "2", label: "2 - College" },
  { value: "3", label: "3 - Bachelor" },
  { value: "4", label: "4 - Master" },
  { value: "5", label: "5 - Doctor" },
];

// Job levels
export const jobLevels = [
  { value: "1", label: "Level 1 - Entry" },
  { value: "2", label: "Level 2 - Junior" },
  { value: "3", label: "Level 3 - Mid" },
  { value: "4", label: "Level 4 - Senior" },
  { value: "5", label: "Level 5 - Executive" },
];

// Stock option levels
export const stockOptionLevels = [
  { value: "0", label: "0 - None" },
  { value: "1", label: "1 - Low" },
  { value: "2", label: "2 - Medium" },
  { value: "3", label: "3 - High" },
];

// Performance ratings
export const performanceRatings = [
  { value: "1", label: "1 - Low" },
  { value: "2", label: "2 - Good" },
  { value: "3", label: "3 - Excellent" },
  { value: "4", label: "4 - Outstanding" },
];

// Default form values with sensible baselines for attributes hidden from the simplified UI
export const defaultFormData = {
  // Personal
  email: "",
  
  // Demographics
  age: "",
  gender: "Male", // baseline
  maritalStatus: "Married", // baseline
  education: "3", // 3 - Bachelor
  educationField: "Other", // baseline
  
  // Job Information
  department: "",
  jobRole: "",
  jobLevel: "2", // 2 - Junior
  businessTravel: "Travel_Rarely", // baseline
  overTime: "",
  
  // Compensation
  monthlyIncome: "",
  dailyRate: "800", // baseline average
  hourlyRate: "65", // baseline average
  monthlyRate: "15000", // baseline average
  percentSalaryHike: "",
  stockOptionLevel: "",
  
  // Experience
  totalWorkingYears: "10", // baseline average
  yearsAtCompany: "",
  yearsInCurrentRole: "3", // baseline
  yearsSinceLastPromotion: "",
  yearsWithCurrManager: "3", // baseline
  numCompaniesWorked: "2", // baseline
  trainingTimesLastYear: "2", // baseline
  
  // Satisfaction & Performance
  environmentSatisfaction: "",
  jobSatisfaction: "",
  relationshipSatisfaction: "3", // 3 - High
  workLifeBalance: "",
  jobInvolvement: "3", // 3 - High
  performanceRating: "3", // 3 - Excellent
  
  // Other
  distanceFromHome: "",
};
