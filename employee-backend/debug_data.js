import mongoose from "mongoose";
import dotenv from "dotenv";
import EmployeePrediction from "./models/EmployeePrediction.model.js";
import axios from "axios";

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const count = await EmployeePrediction.countDocuments();
        console.log(`Total Predictions: ${count}`);

        if (count > 0) {
            const sample = await EmployeePrediction.findOne().sort({ createdAt: -1 });
            console.log("Latest Prediction:", sample);

            const oldSample = await EmployeePrediction.findOne().sort({ createdAt: 1 });
            console.log("Oldest Prediction:", oldSample);
        }

        // Test API Endpoint (assuming server is running on 3000)
        // We need a token if auth is enabled. Authenticate first? 
        // Or just check if we can get data.

        console.log("\nAttempting to fetch dashboard stats...");
        try {
            // Login to get token first (if we have a user)
            // For now, let's assume we might need to bypass auth or use a known user.
            // But looking at the user's previous context, they might not have a user yet.
            // Let's just check the DB first.
        } catch (err) {
            console.error("API Fetch Error:", err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkData();
