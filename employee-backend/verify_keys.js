import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.model.js";
import EmployeePrediction from "./models/EmployeePrediction.model.js";

dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    const latestPredictions = await EmployeePrediction.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$employeeId", riskLevel: { $first: "$riskLevel" } } }
    ]);

    const employees = await Employee.find({});
    
    console.log("PREDICTION ID SAMPLE:", latestPredictions.slice(0, 5).map(p => ({ id: p._id, type: typeof p._id })));
    console.log("EMPLOYEE ID SAMPLE:", employees.slice(0, 5).map(e => ({ id: e.employeeId, type: typeof e.employeeId })));
    
    if (latestPredictions.length > 0 && employees.length > 0) {
        const p0 = latestPredictions[0]._id;
        const e0 = employees.find(e => e.employeeId === p0);
        console.log(`MATCH TEST (${p0}):`, e0 ? "FOUND" : "NOT FOUND");
    }

    process.exit(0);
};
debug();
