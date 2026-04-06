import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        console.log("Connecting to", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

const runBatchPredictions = async () => {
    await connectDB();

    console.log("⏳ Fetching active employees...");
    // Assuming active if no attrition field or attrition is 'No'
    // For now get all
    const employees = await Employee.find({});

    if (employees.length === 0) {
        console.log("❌ No employees found.");
        process.exit(0);
    }

    const predictions = [];
    const now = new Date();

    console.log(`🔍 Analyzing ${employees.length} employees...`);

    for (const emp of employees) {
        // Simplified Logic mimicking a trained model
        let riskScore = 0;

        // 1. Satisfaction (Huge Factor)
        if (emp.jobSatisfaction <= 2) riskScore += 40;
        if (emp.environmentSatisfaction <= 2) riskScore += 20;

        // 2. Compensation
        if (emp.monthlyIncome < 3000) riskScore += 20;
        if (emp.salaryHikePercentage < 11) riskScore += 10;

        // 3. Work Conditions
        if (emp.overtime === 'Yes') riskScore += 15;
        if (emp.workLifeBalance <= 2) riskScore += 15;

        // 4. Tenure
        if (emp.yearsAtCompany < 2) riskScore += 10;

        // Normalize probability (0 to 1)
        // Max score approx 130
        let probability = Math.min(0.99, Math.max(0.01, riskScore / 130));

        // Add randomness (Model uncertainty)
        probability += (Math.random() * 0.1) - 0.05;
        probability = Math.min(0.99, Math.max(0.01, probability));

        let riskLevel = "Low";
        if (probability > 0.7) riskLevel = "High";
        else if (probability > 0.3) riskLevel = "Medium";

        predictions.push({
            employeeId: emp.employeeId,
            prediction: probability > 0.5 ? 1 : 0,
            probability: probability,
            riskLevel: riskLevel,
            createdAt: now
        });
    }

    if (predictions.length > 0) {
        await EmployeePrediction.insertMany(predictions);
        console.log(`✅ Successfully generated ${predictions.length} new predictions.`);
    }

    // Optional: Log stats
    const high = predictions.filter(p => p.riskLevel === 'High').length;
    console.log(`📊 Batch Summary: High Risk - ${high}, Medium - ${predictions.filter(p => p.riskLevel === 'Medium').length}, Low - ${predictions.filter(p => p.riskLevel === 'Low').length}`);

    process.exit(0);
};

runBatchPredictions();
