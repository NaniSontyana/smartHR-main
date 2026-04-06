import mongoose from 'mongoose';
import 'dotenv/config';

// Define schemas locally to avoid import issues
const employeeSchema = new mongoose.Schema({
    employeeId: String,
    department: String,
});
const Employee = mongoose.model('Employee', employeeSchema);

const predictionSchema = new mongoose.Schema({
    employeeId: String,
    riskLevel: String,
});
const EmployeePrediction = mongoose.model('EmployeePrediction', predictionSchema);

async function debugStats() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const allEmployees = await Employee.find({}, { employeeId: 1, department: 1 });
        console.log(`Found ${allEmployees.length} employees`);

        const allPredictions = await EmployeePrediction.find({}, { employeeId: 1, riskLevel: 1, createdAt: 1 }).sort({ createdAt: 1 });
        console.log(`Found ${allPredictions.length} predictions`);

        if (allEmployees.length > 0) {
            console.log("Sample Employee:", allEmployees[0]);
        }
        if (allPredictions.length > 0) {
            console.log("Sample Prediction:", allPredictions[0]);
        }

        const predictionMap = new Map();
        allPredictions.forEach(p => predictionMap.set(p.employeeId, p.riskLevel));

        const deptData = {};
        allEmployees.forEach(emp => {
            const dept = emp.department || "Unknown";
            // Default to Low if no prediction yet, assuming safe
            const risk = predictionMap.get(emp.employeeId) || "Low";

            if (!deptData[dept]) {
                deptData[dept] = { department: dept, Low: 0, Medium: 0, High: 0, Total: 0 };
            }

            // Ensure risk key exists, otherwise fallback or log
            if (deptData[dept][risk] !== undefined) {
                deptData[dept][risk]++;
            } else {
                console.warn(`Unknown risk level '${risk}' for employee ${emp.employeeId}`);
                deptData[dept]["Low"]++; // Default fallback
            }
            deptData[dept].Total++;
        });

        const result = Object.values(deptData).map(d => ({
            department: d.department,
            Low: d.Low,
            Medium: d.Medium,
            High: d.High,
            name: d.department, // specific for Recharts if needed
            value: d.Total
        }));

        console.log("Aggregated Result:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

debugStats();
