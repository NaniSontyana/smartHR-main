import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.model.js";
import EmployeePrediction from "./models/EmployeePrediction.model.js";

dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Get latest status for EVERY employee
    const latestPredictions = await EmployeePrediction.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { 
            _id: "$employeeId", 
            riskLevel: { $first: "$riskLevel" }
        }}
    ]);

    const activeEmps = await Employee.find({ attrition: "No" }, { employeeId: 1 });
    const activeIds = new Set(activeEmps.map(e => e.employeeId));

    let activeHighRisk = 0;
    latestPredictions.forEach(p => {
        if (activeIds.has(p._id) && p.riskLevel === "High") {
            activeHighRisk++;
        }
    });

    console.log(`REPORT_DEBUG: Found ${activeEmps.length} active employees.`);
    console.log(`REPORT_DEBUG: Found ${activeHighRisk} active high risk employees.`);
    
    process.exit(0);
};
debug();
