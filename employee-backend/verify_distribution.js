import mongoose from "mongoose";
import dotenv from "dotenv";
import EmployeePrediction from "./models/EmployeePrediction.model.js";

dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check distribution of LATEST predictions
    const distribution = await EmployeePrediction.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$employeeId", latestRisk: { $first: "$riskLevel" } } },
        { $group: { _id: "$latestRisk", count: { $sum: 1 } } }
    ]);
    
    console.log("LATEST RISK DISTRIBUTION:", distribution);
    process.exit(0);
};
debug();
