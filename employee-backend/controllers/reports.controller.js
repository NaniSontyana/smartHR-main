import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";

export const getReportsData = async (req, res) => {
    try {
        const latestPredictions = await EmployeePrediction.aggregate([
            { $sort: { createdAt: -1 } },
            { $group: { 
                _id: "$employeeId", 
                riskLevel: { $first: "$riskLevel" }
            }}
        ]);

        const employees = await Employee.find({});

        const predictionMap = new Map();
        latestPredictions.forEach(p => predictionMap.set(p._id, p.riskLevel));

        const activeEmployees = employees.filter(e => e.attrition !== "Yes");
        const attritedEmployees = employees.filter(e => e.attrition === "Yes");

        const totalActive = activeEmployees.length;
        const totalAttrited = attritedEmployees.length;
        
        let totalHighRisk = 0;
        activeEmployees.forEach(e => {
            if (predictionMap.get(e.employeeId) === "High") totalHighRisk++;
        });

        const totalHeadcount = employees.length;
        const overallRate = totalHeadcount > 0 ? Math.round((totalAttrited / totalHeadcount) * 100) : 0;

        const calculateStats = (groupByField, labelMap = null) => {
            const stats = {};
            employees.forEach(emp => {
                let key = emp[groupByField];
                if (key === undefined || key === null) key = "N/A";
                if (labelMap && labelMap[key]) key = labelMap[key];

                if (!stats[key]) stats[key] = { total: 0, attritionCount: 0, highRisk: 0 };
                stats[key].total++;
                
                if (emp.attrition === "Yes") {
                    stats[key].attritionCount++;
                } else if (predictionMap.get(emp.employeeId) === "High") {
                    stats[key].highRisk++;
                }
            });

            return Object.entries(stats).map(([key, value]) => ({
                label: key,
                total: value.total,
                highRisk: value.highRisk, 
                attritionCount: value.attritionCount,
                attritionRate: value.total > 0 ? Math.round((value.attritionCount / value.total) * 100) : 0
            })).sort((a, b) => b.attritionRate - a.attritionRate);
        };

        const sumTenure = activeEmployees.reduce((acc, e) => acc + (e.yearsAtCompany || 0), 0);

        // Return EXACT keys that Reports.jsx and api.js expect to avoid undefined issues
        res.json({
            reportSummary: {
                overallAttritionRate: overallRate,
                highRiskEmployees: totalHighRisk,
                totalEmployees: totalActive,
                attritionCount: totalAttrited,
                avgTenure: totalActive > 0 ? Math.round((sumTenure / totalActive) * 10) / 10 : 0,
                // also providing backend names just in case
                avgAttritionRate: overallRate,
                highRiskCount: totalHighRisk
            },
            attritionByDepartment: calculateStats("department"),
            attritionByJobRole: calculateStats("jobRole"),
            attritionByAgeGroup: calculateStats("age"),
            attritionByGender: calculateStats("gender"),
            attritionByEducation: calculateStats("educationLevel"),
            attritionByMaritalStatus: calculateStats("maritalStatus"),
            attritionByJobLevel: calculateStats("jobLevel"),
            attritionByOvertime: calculateStats("overtime"),
            attritionByJobSatisfaction: calculateStats("jobSatisfaction"),
            attritionByPerformance: calculateStats("performanceRating"),
            attritionByYearsAtCompany: calculateStats("yearsAtCompany"),
            attritionByIncome: calculateStats("monthlyIncome")
        });

    } catch (error) {
        console.error("Reports Error:", error);
        res.status(500).json({ message: "Failed", error: error.message });
    }
};
