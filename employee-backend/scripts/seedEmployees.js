import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config(); // fallback to cwd

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  // clear existing data
  await Employee.deleteMany({});
  await EmployeePrediction.deleteMany({});
  console.log("🧹 Cleared existing data");

  const employees = [];
  const predictions = [];

  const profiles = [
    {
      name: "High Attrition Risk",
      dept: "Sales",
      roles: ["Sales Executive", "Sales Representative"],
      risk: "High",
      baseSatisfaction: 1, 
      baseOvertime: "Yes",
      baseIncome: 20000,
    },
    {
      name: "Stable Employee",
      dept: "Research & Development",
      roles: ["Research Scientist", "Laboratory Technician", "Manufacturing Director"],
      risk: "Low",
      baseSatisfaction: 3.5, 
      baseOvertime: "No",
      baseIncome: 60000,
    },
    {
      name: "Moderate Risk",
      dept: "Human Resources",
      roles: ["HR Manager", "HR Executive"],
      risk: "Medium",
      baseSatisfaction: 2.5, 
      baseOvertime: "No",
      baseIncome: 45000,
    },
  ];

  const maritalStatuses = ["Single", "Married", "Divorced"];
  const companySizes = ["Small", "Medium", "Large"];

  const names = [
    "Sarah Jenkins", "Michael Chang", "Jessica Smith", "David Miller", "Emma Wilson", 
    "James Taylor", "Robert Anderson", "William Martinez", "Linda Lee", "Chris Harris",
    "Olivia Martin", "Ethan Thompson", "Ava Robinson", "Mason Garcia", "Sophia Clark"
  ];
  const surnames = ["Smith", "Jones", "Taylor", "Brown", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez"];

  const targetProfiles = [];
  // 755 Research & Development (Low Risk)
  for (let i = 0; i < 755; i++) {
    targetProfiles.push(profiles[1]);
  }
  // 262 Sales (High Risk)
  for (let i = 0; i < 262; i++) {
    targetProfiles.push(profiles[0]);
  }
  // 453 Human Resources (Medium Risk)
  for (let i = 0; i < 453; i++) {
    targetProfiles.push(profiles[2]);
  }

  // Generate 1470 employees
  for (let i = 1; i <= 1470; i++) {
    const profile = targetProfiles[i - 1];
    const role = profile.roles[Math.floor(Math.random() * profile.roles.length)];
    const employeeId = `EMP${1000 + i}`;
    
    // Choose Names
    const randomName = `${names[Math.floor(Math.random() * names.length)].split(' ')[0]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
    const finalName = (employeeId === "EMP1001") ? "Sarah Jenkins" : randomName;
    const finalEmail = (employeeId === "EMP1001") ? "nanisontyana47@gmail.com" : `${finalName.split(' ').join('.').toLowerCase()}@company.com`;

    // 12-14% historical attrition: people who already left the company.
    const isHistoricalAttrition = (profile.risk === "High" && Math.random() < 0.4) || (Math.random() < 0.03);
    const attritionStatus = (employeeId !== "EMP1001" && isHistoricalAttrition) ? "Yes" : "No";

    // HISTORY of predictions (last 12 months)
    const monthsOfHistory = 12;
    for (let m = 0; m < monthsOfHistory; m++) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);

      let prob;
      const riskLevel = profile.risk; // Force to match profile risk

      if (riskLevel === "High") {
        prob = 0.71 + (Math.random() * 0.24);
      } else if (riskLevel === "Medium") {
        prob = 0.41 + (Math.random() * 0.28);
      } else {
        prob = 0.02 + (Math.random() * 0.37);
      }

      predictions.push({
        employeeId: employeeId,
        prediction: prob > 0.5 ? 1 : 0,
        probability: prob,
        riskLevel: riskLevel,
        createdAt: date
      });
    }

    const emp = {
      employeeId,
      name: finalName,
      email: finalEmail,
      attrition: attritionStatus,
      age: Math.floor(Math.random() * 30) + 25,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      maritalStatus: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
      numberOfDependents: Math.floor(Math.random() * 4),
      department: profile.dept,
      jobRole: role,
      jobLevel: Math.floor(Math.random() * 5) + 1,
      educationLevel: Math.floor(Math.random() * 5) + 1,
      monthlyIncome: profile.baseIncome + Math.floor(Math.random() * 10000),
      totalWorkingYears: Math.floor(Math.random() * 20) + 1,
      yearsAtCompany: Math.floor(Math.random() * 10),
      overtime: profile.baseOvertime,
      workLifeBalance: Math.min(4, Math.max(1, profile.baseSatisfaction - 0.5 + Math.floor(Math.random() * 2))),
      jobSatisfaction: Math.min(4, Math.max(1, profile.baseSatisfaction + Math.floor(Math.random() * 2))),
      performanceRating: Math.floor(Math.random() * 2) + 3,
    };

    employees.push(emp);
  }

  await Employee.insertMany(employees);
  console.log(`✅ Inserted ${employees.length} employees`);

  await EmployeePrediction.insertMany(predictions);
  console.log(`✅ Inserted ${predictions.length} predictions`);

  console.log("🌱 Seed complete with realistic Attrition Rate (~13%) and High Risk (~18%).");
  process.exit(0);
};

seedData();
