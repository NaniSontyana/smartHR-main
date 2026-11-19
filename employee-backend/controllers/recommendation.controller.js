import EmployeePrediction from "../models/EmployeePrediction.model.js";
import Employee from "../models/Employee.model.js";

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

/**
 * Generate an executive Prescriptive Retention Playbook tailored to a specific high-risk employee
 */
export const getRetentionPlaybook = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }

    const employee = await Employee.findOne({ employeeId }).lean();
    const latestPrediction = await EmployeePrediction.findOne({ employeeId })
      .sort({ createdAt: -1 })
      .lean();

    const name = employee?.name || employeeId;
    const role = employee?.jobRole || "Key Specialist";
    const dept = employee?.department || "Operations";
    const monthlyIncome = employee?.monthlyIncome || 5000;
    const replacementCost = Math.round(monthlyIncome * 12 * 0.75);
    const riskScore = latestPrediction ? Math.round(latestPrediction.probability * 100) : 75;
    const factors = latestPrediction?.factors || [];

    // Analyze primary drivers
    const hasOvertime = (employee?.overtime === "Yes" || employee?.overTime === "Yes") || factors.some(f => f.name.toLowerCase().includes("overtime"));
    const hasLowComp = monthlyIncome < 4500 || factors.some(f => f.name.toLowerCase().includes("compensation"));
    const hasLowSat = (employee?.jobSatisfaction || 3) <= 2 || factors.some(f => f.name.toLowerCase().includes("satisfaction"));
    const hasWlb = (employee?.workLifeBalance || 3) <= 2 || factors.some(f => f.name.toLowerCase().includes("balance"));

    // Tailored action levers
    const recommendedLevers = [];
    if (hasLowComp) {
      recommendedLevers.push({
        type: "compensation",
        title: "Market Equity Adjustment",
        description: `Implement an immediate base salary adjustment of +$${Math.round(monthlyIncome * 0.12)}/mo to match 75th percentile market parity.`,
        financialCost: Math.round(monthlyIncome * 0.12 * 12),
        expectedRiskReduction: "-22%"
      });
    }
    if (hasOvertime) {
      recommendedLevers.push({
        type: "workload",
        title: "Overtime Cap & Task Offloading",
        description: "Re-distribute sprint overflow tickets to cross-functional peers; enforce a 40-hour cap.",
        financialCost: 0,
        expectedRiskReduction: "-25%"
      });
    }
    if (hasLowSat || hasWlb || recommendedLevers.length === 0) {
      recommendedLevers.push({
        type: "flexibility",
        title: "Flexible Work Arrangement & Recognition",
        description: "Offer hybrid flexibility (2 days remote) and assign leadership of a high-visibility project.",
        financialCost: 500,
        expectedRiskReduction: "-18%"
      });
    }

    // Manager 1-on-1 Script
    const managerScript = {
      opening: `Hi ${name}, thank you for taking the time to sync today. I wanted to check in personally on how your experience has been over the past quarter and ensure your current projects align with your career ambitions here.`,
      probingQuestions: [
        hasOvertime ? "I noticed you've been putting in extra hours recently on team deliverables. How sustainable does the current workload feel for you?" : "Which projects recently have given you the highest energy and fulfillment?",
        hasLowComp ? "Are there specific professional growth and compensation milestones you are aiming to reach in the next 6-12 months?" : "How supported do you feel by current team resources and tooling?",
        "If you could adjust one aspect of your day-to-day role starting next week, what would make the biggest positive difference?"
      ],
      commitments: [
        "Commit to a structured follow-up within 10 business days.",
        hasLowComp ? "Initiate an off-cycle compensation review with People Ops." : "Review workload distribution with technical leads.",
        "Formalize a transparent career progression ladder towards senior leadership."
      ]
    };

    return res.json({
      success: true,
      employeeId,
      name,
      role,
      department: dept,
      riskScore,
      replacementCost,
      riskFactors: factors,
      recommendedLevers,
      managerScript,
      status: "Ready for Execution"
    });

  } catch (error) {
    console.error("Playbook generation error:", error);
    res.status(500).json({ message: "Failed to generate retention playbook", error: error.message });
  }
};
