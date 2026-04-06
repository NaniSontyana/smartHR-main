import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmployeePrediction from './models/EmployeePrediction.model.js';
import Employee from './models/Employee.model.js';

dotenv.config();

const seedPredictions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Get some employees to assign predictions to
        const employees = await Employee.find().limit(20);

        if (employees.length === 0) {
            console.log("No employees found to seed predictions for.");
            process.exit(0);
        }

        const predictions = [];
        const riskLevels = ["Low", "Low", "Medium", "High", "High"]; // Bias towards high for testing

        for (const emp of employees) {
            const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
            const probability = riskLevel === "High" ? 0.85 : (riskLevel === "Medium" ? 0.45 : 0.1);

            // Create prediction for past months to populate trend chart too
            for (let i = 0; i < 6; i++) { // Increased to 6 months
                const date = new Date();
                date.setMonth(date.getMonth() - i);

                predictions.push({
                    employeeId: emp.employeeId, // Correct field from schema
                    prediction: riskLevel === "High" ? 1 : 0,
                    probability: probability,
                    riskLevel: riskLevel,
                    createdAt: date
                });
            }
        }

        await EmployeePrediction.insertMany(predictions);
        console.log(`Seeded ${predictions.length} predictions.`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedPredictions();
