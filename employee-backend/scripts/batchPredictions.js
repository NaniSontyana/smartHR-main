import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";
import { runBatchPrediction } from "../services/ml.service.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
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

    console.log("⏳ Fetching active employees from database...");
    const employees = await Employee.find({}).lean();

    if (employees.length === 0) {
        console.log("❌ No employees found in database.");
        process.exit(0);
    }

    console.log(`🔍 Analyzing ${employees.length} employees...`);
    const now = new Date();
    let predictions = [];

    try {
        const mlResponse = await runBatchPrediction(employees);
        if (mlResponse && Array.isArray(mlResponse.predictions) && mlResponse.predictions.length > 0) {
            predictions = mlResponse.predictions.map(p => ({
                employeeId: p.employeeId,
                prediction: p.prediction,
                probability: p.probability,
                riskLevel: p.riskLevel,
                factors: p.factors || [],
                createdAt: now
            }));
            console.log(`✅ Received ${predictions.length} predictions from ML microservice.`);
        }
    } catch (err) {
        console.warn("⚠️ ML microservice unavailable, using deterministic heuristics:", err.message);
    }

    if (predictions.length === 0) {
        for (const emp of employees) {
            let riskScore = 0;
            const factors = [];

            if ((emp.jobSatisfaction || 3) <= 2) {
                riskScore += 35;
                factors.push({ name: "Low Job Satisfaction", impact: 35 });
            }
            if ((emp.environmentSatisfaction || 3) <= 2) {
                riskScore += 20;
                factors.push({ name: "Work Environment", impact: 20 });
            }
            if ((emp.monthlyIncome || 5000) < 3500) {
                riskScore += 30;
                factors.push({ name: "Below Market Compensation", impact: 30 });
            }
            if (emp.overtime === 'Yes' || emp.overTime === 'Yes') {
                riskScore += 25;
                factors.push({ name: "High Overtime Demands", impact: 25 });
            }
            if ((emp.workLifeBalance || 3) <= 2) {
                riskScore += 15;
                factors.push({ name: "Work-Life Balance", impact: 15 });
            }

            const probability = Math.min(0.95, Math.max(0.05, riskScore / 125));
            let riskLevel = "Low";
            if (probability >= 0.7) riskLevel = "High";
            else if (probability >= 0.35) riskLevel = "Medium";

            predictions.push({
                employeeId: emp.employeeId,
                prediction: probability > 0.5 ? 1 : 0,
                probability: Math.round(probability * 100) / 100,
                riskLevel,
                factors,
                createdAt: now
            });
        }
    }

    if (predictions.length > 0) {
        await EmployeePrediction.insertMany(predictions);
        console.log(`🎉 Successfully inserted ${predictions.length} predictions into database!`);
    }

    await mongoose.connection.close();
    process.exit(0);
};

runBatchPredictions().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
