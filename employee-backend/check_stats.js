import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmployeePrediction from './models/EmployeePrediction.model.js';
import Employee from './models/Employee.model.js';

dotenv.config();

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const totalEmployees = await Employee.countDocuments();
        const totalPredictions = await EmployeePrediction.countDocuments();
        const highRiskCount = await EmployeePrediction.countDocuments({ riskLevel: "High" });
        const mediumRiskCount = await EmployeePrediction.countDocuments({ riskLevel: "Medium" });
        const lowRiskCount = await EmployeePrediction.countDocuments({ riskLevel: "Low" });

        console.log("--- Database Stats ---");
        console.log(`Total Employees: ${totalEmployees}`);
        console.log(`Total Predictions: ${totalPredictions}`);
        console.log(`High Risk Predictions: ${highRiskCount}`);
        console.log(`Medium Risk Predictions: ${mediumRiskCount}`);
        console.log(`Low Risk Predictions: ${lowRiskCount}`);

        if (totalPredictions > 0) {
            const rate = (highRiskCount / totalPredictions) * 100;
            console.log(`Calculated Attrition Rate (High/TotalPred): ${rate.toFixed(2)}%`);
        } else {
            console.log("Attrition Rate: 0% (No predictions)");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkStats();
