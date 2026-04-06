import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.model.js';

dotenv.config();

const verifyDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const employees = await Employee.find({});
        console.log(`Total Employees: ${employees.length}`);

        const departments = {};
        employees.forEach(emp => {
            const dept = emp.department || "Unknown";
            if (!departments[dept]) departments[dept] = 0;
            departments[dept]++;
        });

        console.log("Department Counts:", departments);

        if (Object.keys(departments).length === 0) {
            console.log("WARNING: No department data found!");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyDepartments();
