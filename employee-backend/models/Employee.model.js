import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    attrition: { type: String, enum: ["Yes", "No"], default: "No" },

    // Demographics
    age: Number,
    gender: String,
    maritalStatus: String,
    numberOfDependents: Number,

    // Job details
    department: String,
    jobRole: String,
    jobLevel: Number,
    educationLevel: Number,

    // Compensation & experience
    monthlyIncome: Number,
    totalWorkingYears: Number,
    yearsAtCompany: Number,
    companyTenure: Number,

    // Work conditions
    overtime: String,
    remoteWork: String,
    distanceFromHome: Number,

    // Satisfaction & performance
    workLifeBalance: Number,
    jobSatisfaction: Number,
    performanceRating: Number,
    numberOfPromotions: Number,

    // Company environment
    companySize: String,
    companyReputation: Number,
    employeeRecognition: Number,
    innovationOpportunities: Number,
    leadershipOpportunities: Number
  },
  { timestamps: true }
);

// Performance indexes for departmental filtering and search
employeeSchema.index({ department: 1, jobRole: 1 });
employeeSchema.index({ department: 1, monthlyIncome: 1 });

export default mongoose.model("Employee", employeeSchema);
