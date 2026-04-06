
import axios from 'axios';

// Simple script to hit the reports endpoint with the auth token logic simulated
// Since we can't easily get the token here without login, we will try to just run the controller function logic directly
// OR we can use the existing 'check_stats.js' approach but for reports.

// Let's create a script that connects to DB and runs the getReportsData logic manually

import mongoose from 'mongoose';
import 'dotenv/config';
import Employee from './models/Employee.model.js';
import EmployeePrediction from './models/EmployeePrediction.model.js';

async function verifyReports() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Reports Verification");

        const predictions = await EmployeePrediction.find({}, { employeeId: 1, riskLevel: 1 }).sort({ createdAt: 1 });
        const employees = await Employee.find({});

        console.log(`Found ${employees.length} employees`);
        console.log(`Found ${predictions.length} predictions`);

        const predictionMap = new Map();
        predictions.forEach(p => predictionMap.set(p.employeeId, p.riskLevel));

        const highRiskSet = new Set();
        predictions.forEach(p => {
            if (p.riskLevel === 'High') highRiskSet.add(p.employeeId);
        });

        console.log(`High Risk Employees Count (from predictions): ${highRiskSet.size}`);

        // Test one category: Department
        const stats = {};
        employees.forEach(emp => {
            const key = emp.department || "Unknown";
            if (!stats[key]) stats[key] = { total: 0, highRisk: 0 };
            stats[key].total++;
            // Logic check: are we matching IDs correctly?
            // Prediction ID: "EMP001", Employee ID: "EMP001"
            const risk = predictionMap.get(emp.employeeId);
            if (risk === "High") {
                stats[key].highRisk++;
            }
        });

        const attritionByDepartment = Object.entries(stats).map(([key, value]) => ({
            department: key,
            total: value.total,
            highRisk: value.highRisk,
            attritionRate: value.total > 0 ? Math.round((value.highRisk / value.total) * 100) : 0
        }));

        console.log("Attrition by Department Sample:", JSON.stringify(attritionByDepartment, null, 2));

        if (attritionByDepartment.length === 0) {
            console.error("CRITICAL: No department data aggregated. Charts will be empty.");
        } else if (attritionByDepartment.every(d => d.value === 0)) {
            console.warn("WARNING: All attrition rates are 0. Charts will look flat.");
        } else {
            console.log("SUCCESS: Data looks populated.");
        }

    } catch (error) {
        console.error("Verification Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyReports();
