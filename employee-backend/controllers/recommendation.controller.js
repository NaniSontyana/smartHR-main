import EmployeePrediction from "../models/EmployeePrediction.model.js";

export const getRecommendations = async (req, res) => {
  try {
    // 1. Get the latest high-risk predictions
    const highRisk = await EmployeePrediction.find({ riskLevel: "High" })
        .sort({ createdAt: -1 })
        .limit(5);

    // 2. Generate recommendations based on the findings
    const recommendations = [];

    if (highRisk.length > 0) {
        const topRisk = highRisk[0]; // The most critical one
        recommendations.push({
            type: "high",
            title: `Meeting: ${topRisk.employeeId}`,
            description: `Schedule an urgent 1-on-1 with this high-risk employee to discuss career growth.`,
            actionText: "Schedule Now",
            employeeId: topRisk.employeeId
        });

        recommendations.push({
            type: "high",
            title: "Urgent: Dept Review",
            description: `High risk detected for ${highRisk.length} total employees. Review environment scores.`,
            actionText: "Run Dept Audit"
        });
    }

    // Add generic but helpful enterprise recommendations
    recommendations.push({
        type: "medium",
        title: "Review Compensation Gap",
        description: "Benchmark salary vs market for Sales department and adjust if needed.",
        actionText: "View Analysis"
    });

    recommendations.push({
        type: "low",
        title: "Upcoming Work Anniversaries",
        description: "24 employees reaching 5-year milestones this quarter.",
        actionText: "Plan Rewards"
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};
