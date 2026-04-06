import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmployeePrediction from './models/EmployeePrediction.model.js';

dotenv.config();

const clearPredictions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const result = await EmployeePrediction.deleteMany({});
        console.log(`Deleted ${result.deletedCount} predictions. Run npm run predict:batch to recreate them. `);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

clearPredictions();
