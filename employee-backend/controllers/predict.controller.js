import { runPrediction, runBatchPrediction, runSimulation } from "../services/ml.service.js";
import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";
import { emitNotification, emitBatchProgress, emitDashboardSync } from "../config/socket.js";

/**
 * Predict attrition risk for an individual employee
 */
export const predictAttrition = async (req, res) => {
  try {
    const employeeData = req.body;

    if (!employeeData || Object.keys(employeeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee data is required for prediction"
      });
    }

    let result;
    try {
      result = await runPrediction(employeeData);
    } catch (mlError) {
      console.warn("⚠️ ML microservice unavailable, employing calibrated fallback heuristics:", mlError.message);
      
      let riskScore = 0;
      const factors = [];
      const sat = parseInt(employeeData.jobSatisfaction || 3);
      if (sat <= 2) {
        riskScore += 35;
        factors.push({ name: "Low Job Satisfaction", impact: 35, description: "Low expressed satisfaction with role." });
      }

      const envSat = parseInt(employeeData.environmentSatisfaction || 3);
      if (envSat <= 2) {
        riskScore += 20;
        factors.push({ name: "Work Environment", impact: 20, description: "Lower workplace environment satisfaction score." });
      }

      if (employeeData.overTime === 'Yes' || employeeData.overtime === 'Yes') {
        riskScore += 25;
        factors.push({ name: "High Overtime Demands", impact: 25, description: "Overtime increases turnover hazard." });
      }

      const income = parseInt(employeeData.monthlyIncome || 5000);
      if (income < 3500) {
        riskScore += 30;
        factors.push({ name: "Below Market Compensation", impact: 30, description: "Compensation falls below department median." });
      }
      
      const probability = Math.min(0.95, Math.max(0.05, riskScore / 110));
      let riskLevel = "Low";
      if (probability >= 0.7) riskLevel = "High";
      else if (probability >= 0.35) riskLevel = "Medium";

      result = {
        prediction: probability > 0.5 ? 1 : 0,
        probability: Math.round(probability * 100) / 100,
        riskLevel,
        factors
      };
    }

    const employeeId = employeeData.employeeId || "EMP_" + Date.now().toString().slice(-6);

    const savedPrediction = await EmployeePrediction.create({
      employeeId,
      prediction: result.prediction,
      probability: result.probability,
      riskLevel: result.riskLevel,
      factors: result.factors || []
    });

    // Real-Time Alert Broadcast if High Risk
    if (result.riskLevel === "High") {
      emitNotification({
        id: `notif_${Date.now()}`,
        employeeName: employeeData.name || employeeId,
        message: `High risk detected (${Math.round(result.probability * 100)}%) for ${employeeData.name || employeeId}. Intervention recommended.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    emitDashboardSync();

    return res.json({
      success: true,
      data: {
        employeeId,
        prediction: result.prediction,
        probability: result.probability,
        riskLevel: result.riskLevel,
        factors: result.factors || []
      }
    });

  } catch (error) {
    console.error("Prediction Controller Error:", error);
    res.status(500).json({ success: false, message: "Prediction failed", error: error.message });
  }
};

/**
 * Run vectorized batch predictions across all active employees
 */
export const runBatchPredictions = async (req, res) => {
  try {
    console.log("⏳ Initiating enterprise batch predictions...");
    const employees = await Employee.find({}).lean();

    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found in database to evaluate." });
    }

    let predictionsToInsert = [];
    const now = new Date();

    try {
      // 1. Attempt batch prediction via ML Microservice
      const mlResponse = await runBatchPrediction(employees);
      if (mlResponse && Array.isArray(mlResponse.predictions) && mlResponse.predictions.length > 0) {
        predictionsToInsert = mlResponse.predictions.map(p => ({
          employeeId: p.employeeId,
          prediction: p.prediction,
          probability: p.probability,
          riskLevel: p.riskLevel,
          factors: p.factors || [],
          createdAt: now
        }));
      }
    } catch (mlErr) {
      console.warn("⚠️ ML Batch microservice unavailable, using deterministic heuristics fallback:", mlErr.message);
    }

    // 2. Fallback if ML microservice did not return records
    if (predictionsToInsert.length === 0) {
      for (const emp of employees) {
        let riskScore = 0;
        const factors = [];

        if (emp.jobSatisfaction <= 2) {
          riskScore += 35;
          factors.push({ name: "Low Job Satisfaction", impact: 35 });
        }
        if (emp.environmentSatisfaction <= 2) {
          riskScore += 20;
          factors.push({ name: "Work Environment", impact: 20 });
        }
        if (emp.monthlyIncome < 3500) {
          riskScore += 30;
          factors.push({ name: "Below Market Compensation", impact: 30 });
        }
        if (emp.overtime === 'Yes' || emp.overTime === 'Yes') {
          riskScore += 25;
          factors.push({ name: "High Overtime Demands", impact: 25 });
        }
        if (emp.workLifeBalance <= 2) {
          riskScore += 15;
          factors.push({ name: "Work-Life Balance", impact: 15 });
        }

        const probability = Math.min(0.95, Math.max(0.05, riskScore / 125));
        let riskLevel = "Low";
        if (probability >= 0.7) riskLevel = "High";
        else if (probability >= 0.35) riskLevel = "Medium";

        predictionsToInsert.push({
          employeeId: emp.employeeId,
          prediction: probability > 0.5 ? 1 : 0,
          probability: Math.round(probability * 100) / 100,
          riskLevel,
          factors,
          createdAt: now
        });
      }
    }

    if (predictionsToInsert.length > 0) {
      await EmployeePrediction.insertMany(predictionsToInsert);
    }

    // Emit live completion event & signal all dashboards to synchronize
    emitBatchProgress({
      processed: predictionsToInsert.length,
      total: employees.length,
      percent: 100,
      completed: true
    });
    emitDashboardSync();

    res.json({
      success: true,
      message: `Successfully generated and saved ${predictionsToInsert.length} predictions`,
      count: predictionsToInsert.length
    });

  } catch (error) {
    console.error("Batch Prediction Error:", error);
    res.status(500).json({ success: false, message: "Batch prediction failed", error: error.message });
  }
};

/**
 * Run counterfactual "what-if" retention intervention simulation for an employee
 */
export const simulateIntervention = async (req, res) => {
  try {
    const { employee, interventions } = req.body;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee profile is required for simulation"
      });
    }

    let result;
    try {
      result = await runSimulation(employee, interventions || {});
    } catch (mlError) {
      console.warn("⚠️ ML microservice simulation unavailable, employing mathematical model fallback:", mlError.message);

      // Calibrated mathematical counterfactual simulator
      const monthlyIncome = parseFloat(employee.monthlyIncome || employee.MonthlyIncome || 5000);
      const salaryInc = parseFloat(interventions?.salaryIncrease || 0);
      const removeOT = Boolean(interventions?.removeOvertime);
      const satBoost = parseInt(interventions?.improveSatisfaction || 0);
      const wlbBoost = parseInt(interventions?.workLifeBalanceBoost || 0);
      const promo = Boolean(interventions?.promotion);

      let baseScore = 0;
      const baseFactors = [];
      const sat = parseInt(employee.jobSatisfaction || employee.JobSatisfaction || 3);
      if (sat <= 2) {
        baseScore += 35;
        baseFactors.push({ name: "Low Job Satisfaction", impact: 35, description: "Low expressed satisfaction with role." });
      }
      const otVal = (employee.overTime || employee.overtime || "").toString().toLowerCase();
      if (otVal === 'yes' || otVal === 'true') {
        baseScore += 25;
        baseFactors.push({ name: "High Overtime Demands", impact: 25, description: "Overtime increases turnover hazard." });
      }
      if (monthlyIncome < 3500) {
        baseScore += 30;
        baseFactors.push({ name: "Below Market Compensation", impact: 30, description: "Compensation falls below department median." });
      } else if (monthlyIncome < 5000) {
        baseScore += 15;
        baseFactors.push({ name: "Moderate Compensation", impact: 15, description: "Salary trajectory has room for competitive alignment." });
      }
      const wlb = parseInt(employee.workLifeBalance || employee.WorkLifeBalance || 3);
      if (wlb <= 2) {
        baseScore += 20;
        baseFactors.push({ name: "Poor Work-Life Balance", impact: 20, description: "Work demands encroaching on personal recovery." });
      }

      const baseProb = Math.min(0.95, Math.max(0.05, (baseScore || 20) / 110));

      // Calculate simulated counterfactual score
      let simScore = baseScore;
      if (satBoost > 0) simScore = Math.max(0, simScore - (satBoost * 18));
      if (removeOT) simScore = Math.max(0, simScore - 25);
      if (salaryInc >= 1500) simScore = Math.max(0, simScore - 25);
      else if (salaryInc >= 500) simScore = Math.max(0, simScore - 15);
      if (wlbBoost > 0) simScore = Math.max(0, simScore - (wlbBoost * 12));
      if (promo) simScore = Math.max(0, simScore - 15);

      const simProb = Math.min(0.95, Math.max(0.05, (simScore || 10) / 110));

      const getLvl = (p) => (p >= 0.7 ? "High" : (p >= 0.35 ? "Medium" : "Low"));
      const replacementCost = (monthlyIncome * 12) * 0.75;
      const baseLoss = replacementCost * baseProb;
      const simLoss = replacementCost * simProb;
      const avoidedLoss = Math.max(0, baseLoss - simLoss);
      const annualCost = (salaryInc * 12) + (wlbBoost > 0 ? 600 : 0);
      const netSavings = avoidedLoss - annualCost;
      const roi = annualCost > 0 ? Math.round((netSavings / annualCost) * 1000) / 10 : 0;

      result = {
        success: true,
        baseline: {
          probability: Math.round(baseProb * 100) / 100,
          riskScore: Math.round(baseProb * 100),
          riskLevel: getLvl(baseProb),
          factors: baseFactors
        },
        simulated: {
          probability: Math.round(simProb * 100) / 100,
          riskScore: Math.round(simProb * 100),
          riskLevel: getLvl(simProb),
          factors: []
        },
        impact: {
          riskDelta: Math.round((baseProb - simProb) * 1000) / 10,
          riskReductionPercent: Math.round(((baseProb - simProb) / Math.max(0.01, baseProb)) * 1000) / 10,
          replacementCost: Math.round(replacementCost),
          avoidedLoss: Math.round(avoidedLoss),
          annualInterventionCost: Math.round(annualCost),
          netSavings: Math.round(netSavings),
          roiPercentage: roi,
          neutralizedFactors: baseFactors.map(f => f.name)
        }
      };
    }

    return res.json(result);
  } catch (error) {
    console.error("Simulation Controller Error:", error);
    res.status(500).json({ success: false, message: "Simulation failed", error: error.message });
  }
};
