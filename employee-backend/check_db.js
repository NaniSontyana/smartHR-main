import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.model.js";
import Employee from "./models/Employee.model.js";
import EmployeePrediction from "./models/EmployeePrediction.model.js";

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const userCount = await User.countDocuments();
        const employeeCount = await Employee.countDocuments();
        const predictionCount = await EmployeePrediction.countDocuments();

        console.log("--------------------------------");
        console.log(`Users: ${userCount}`);
        console.log(`Employees: ${employeeCount}`);
        console.log(`Predictions: ${predictionCount}`);
        console.log("--------------------------------");

        if (userCount > 0) {
            const user = await User.findOne();
            console.log("Sample User Email:", user.email);
        }

        process.exit();
    } catch (error) {
        console.error("DB Check Error:", error);
        process.exit(1);
    }
};

checkDB();
