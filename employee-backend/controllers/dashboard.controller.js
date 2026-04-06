import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const period = req.query.period || 'monthly';
        let matchStage = {};
        let groupStage = {};
        let sortStage = {};
        let periods = [];
        const now = new Date();

        if (period === 'yearly') {
            const startYear = now.getFullYear() - 4;
            const pastDate = new Date(startYear, 0, 1);
            matchStage = { createdAt: { $gte: pastDate } };
            groupStage = { _id: { year: { $year: "$createdAt" } }, avgRisk: { $avg: "$probability" } };
            sortStage = { "_id.year": 1 };
            for (let i = 0; i < 5; i++) periods.push({ year: startYear + i, label: (startYear + i).toString() });
        } else if (period === 'quarterly') {
            const pastDate = new Date();
            pastDate.setMonth(now.getMonth() - 12);
            matchStage = { createdAt: { $gte: pastDate } };
            groupStage = {
                _id: { year: { $year: "$createdAt" }, quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } } },
                avgRisk: { $avg: "$probability" }
            };
            sortStage = { "_id.year": 1, "_id.quarter": 1 };
            let q = Math.ceil((now.getMonth() + 1) / 3);
            let y = now.getFullYear();
            for (let i = 3; i >= 0; i--) {
                let tq = q - i;
                let ty = y;
                while (tq <= 0) { tq += 4; ty--; }
                periods.push({ year: ty, quarter: tq, label: `Q${tq} ${ty}` });
            }
        } else {
            const pastDate = new Date();
            pastDate.setMonth(now.getMonth() - 5);
            pastDate.setDate(1);
            pastDate.setHours(0, 0, 0, 0);
            matchStage = { createdAt: { $gte: pastDate } };
            groupStage = {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                avgRisk: { $avg: "$probability" }
            };
            sortStage = { "_id.year": 1, "_id.month": 1 };
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                periods.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
            }
        }

        // --- CONCURRENT DATABASE QUERIES ---
        const [
            totalEmployees,
            satisfactionResult,
            totalPredictions,
            highRiskCount,
            latestPredictions,
            trendData,
            latestHighRisk,
            allEmployees
        ] = await Promise.all([
            Employee.countDocuments(),
            Employee.aggregate([{ $group: { _id: null, avgSatisfaction: { $avg: "$jobSatisfaction" } } }]),
            EmployeePrediction.countDocuments(),
            EmployeePrediction.countDocuments({ riskLevel: "High" }),
            EmployeePrediction.aggregate([
                { $sort: { createdAt: -1 } },
                { $group: { _id: "$employeeId", riskLevel: { $first: "$riskLevel" } } }
            ]),
            EmployeePrediction.aggregate([
                { $match: matchStage },
                { $group: groupStage },
                { $sort: sortStage }
            ]),
            EmployeePrediction.aggregate([
                { $sort: { createdAt: -1 } },
                { $group: { _id: "$employeeId", probability: { $first: "$probability" }, riskLevel: { $first: "$riskLevel" } } },
                { $match: { riskLevel: "High" } },
                { $sort: { probability: -1 } },
                { $limit: 15 }
            ]),
            Employee.find({}, { 
                employeeId: 1, 
                department: 1, 
                jobRole: 1, 
                name: 1,
                jobSatisfaction: 1,
                workLifeBalance: 1,
                overtime: 1,
                monthlyIncome: 1
            }) // Fetch needed fields for factors
        ]);
        // -----------------------------------

        if (totalEmployees === 0) {
            return res.json({
                dashboardStats: { totalEmployees: 0, attritionRate: 0, employeeSatisfaction: 0 },
                departmentPieData: [], attritionTrendData: [], highRiskEmployees: []
            });
        }

        const employeeSatisfaction = satisfactionResult.length > 0 ? Math.round((satisfactionResult[0].avgSatisfaction / 4) * 100) : 0;
        
        const currentHighRiskCount = latestPredictions.filter(p => p.riskLevel === 'High').length;
        const attritionRate = latestPredictions.length > 0 ? Math.round((currentHighRiskCount / latestPredictions.length) * 100) : 0;

        const predictionMap = new Map();
        latestPredictions.forEach(p => predictionMap.set(p._id, p.riskLevel));

        const deptData = {};
        allEmployees.forEach(emp => {
            const dept = emp.department || "Unknown";
            const risk = predictionMap.get(emp.employeeId) || "Low";

            if (!deptData[dept]) {
                deptData[dept] = { department: dept, Low: 0, Medium: 0, High: 0, Total: 0 };
            }
            deptData[dept][risk]++;
            deptData[dept].Total++;
        });

        const departmentPieData = Object.values(deptData).map(d => ({
            department: d.department, Low: d.Low, Medium: d.Medium, High: d.High, name: d.department, value: d.Total
        }));

        const formattedTrendData = periods.map(p => {
            let match;
            if (period === 'yearly') {
                match = trendData.find(item => item._id.year === p.year);
            } else if (period === 'quarterly') {
                match = trendData.find(item => item._id.year === p.year && item._id.quarter === p.quarter);
            } else {
                match = trendData.find(item => item._id.year === p.year && item._id.month === p.month);
            }

            return {
                month: p.label,
                value: match ? Math.round(match.avgRisk * 100) : 0
            };
        });

        // 6. High Risk Employees - Fetched in Promise.all above

        const highRiskEmployeeIds = latestHighRisk.map(p => p._id);
        const highRiskEmployeesDetails = await Employee.find({ employeeId: { $in: highRiskEmployeeIds } });

        const empMap = new Map();
        highRiskEmployeesDetails.forEach(e => empMap.set(e.employeeId, e));

        const combinedHighRisk = latestHighRisk.map(p => {
            const emp = empMap.get(p._id);
            return {
                id: p._id,
                name: emp ? (emp.name || emp.employeeId) : p._id,
                role: emp ? emp.jobRole : "Unknown",
                department: emp ? emp.department : "Unknown",
                riskScore: Math.round(p.probability * 100),
                avatar: null
            };
        });

        // 7. Calculate High Risk Factors
        const factorCounts = {
            "Job Satisfaction": 0,
            "Overtime Work": 0,
            "Work-Life Balance": 0,
            "Monthly Income": 0
        };

        const highRiskEmps = allEmployees.filter(e => predictionMap.get(e.employeeId) === "High");
        highRiskEmps.forEach(e => {
            if ((e.jobSatisfaction || 0) <= 2) factorCounts["Job Satisfaction"]++;
            if (e.overtime === "Yes") factorCounts["Overtime Work"]++;
            if ((e.workLifeBalance || 0) <= 2) factorCounts["Work-Life Balance"]++;
            if ((e.monthlyIncome || 0) < 5000) factorCounts["Monthly Income"]++;
        });

        const highRiskFactors = Object.entries(factorCounts)
            .filter(([_, count]) => count > 0)
            .map(([factor, count]) => ({
                factor,
                percentage: highRiskEmps.length > 0 ? Math.round((count / highRiskEmps.length) * 100) : 0
            }))
            .sort((a, b) => b.percentage - a.percentage);

        res.json({
            dashboardStats: {
                totalEmployees,
                attritionRate,
                employeeSatisfaction
            },
            departmentPieData,
            attritionTrendData: formattedTrendData,
            highRiskEmployees: combinedHighRisk,
            highRiskFactors
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

export const getHighRiskEmployees = async (req, res) => {
    try {
        const latestHighRisk = await EmployeePrediction.aggregate([
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$employeeId", probability: { $first: "$probability" }, riskLevel: { $first: "$riskLevel" } } },
            { $match: { riskLevel: "High" } },
            { $sort: { probability: -1 } }
        ]);

        const highRiskEmployeeIds = latestHighRisk.map(p => p._id);
        const highRiskEmployeesDetails = await Employee.find({ employeeId: { $in: highRiskEmployeeIds } });

        const empMap = new Map();
        highRiskEmployeesDetails.forEach(e => empMap.set(e.employeeId, e));

        const combinedHighRisk = latestHighRisk.map(p => {
            const emp = empMap.get(p._id);
            return {
                id: p._id,
                name: emp ? (emp.name || emp.employeeId) : p._id,
                role: emp ? emp.jobRole : "Unknown",
                department: emp ? emp.department : "Unknown",
                riskScore: Math.round(p.probability * 100),
                avatar: null
            };
        });

        res.json(combinedHighRisk);
    } catch (error) {
        console.error("High Risk Employees Error:", error);
        res.status(500).json({ message: "Failed to fetch high risk employees", error: error.message });
    }
};
