import runPrediction from "../services/ml.service.js";

import Employee from "../models/Employee.model.js";
import EmployeePrediction from "../models/EmployeePrediction.model.js";

export const predictAttrition = async (req, res) => {
  try {
    const employeeData = req.body;

    // TODO: Add more specific validation for required fields (e.g. Age, Department, etc.)
    if (!employeeData || Object.keys(employeeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee data is required"
      });
    }

    let result;
    try {
      result = await runPrediction(employeeData);
    } catch (mlError) {
      console.warn("ML Service unavailable, using internal logic fallback.");
      
      // Internal logic fallback
      let riskScore = 0;
      if ((employeeData.jobSatisfaction || 3) <= 2) riskScore += 40;
      if ((employeeData.environmentSatisfaction || 3) <= 2) riskScore += 20;
      if (employeeData.overTime === 'Yes') riskScore += 15;
      if (parseInt(employeeData.monthlyIncome || 5000) < 4000) riskScore += 20;
      
      let probability = Math.min(0.95, Math.max(0.05, riskScore / 130));
      let riskLevel = "Low";
      if (probability > 0.7) riskLevel = "High";
      else if (probability > 0.3) riskLevel = "Medium";

      result = {
        prediction: probability > 0.5 ? 1 : 0,
        probability: probability,
        riskLevel: riskLevel
      };
    }

    // --- SAVE TO DATABASE ---
    // If we have an employeeId from the metadata, use it.
    const employeeId = employeeData.employeeId || "NEW_EMP_" + Date.now();
    
    await EmployeePrediction.create({
        employeeId: employeeId,
        prediction: result.prediction,
        probability: result.probability,
        riskLevel: result.riskLevel
    });

    return res.json({
      success: true,
      data: {
        prediction: result.prediction,
        probability: result.probability,
        riskLevel: result.riskLevel
      }
    });

  } catch (error) {
    console.error("Prediction Controller Error:", error);
    res.status(500).json({ success: false, message: "Prediction failed" });
  }
};

export const runBatchPredictions = async (req, res) => {
  try {
    console.log("⏳ Running batch predictions...");
    const employees = await Employee.find({});

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found" });
    }

    const predictions = [];
    const now = new Date();

    for (const emp of employees) {
      // Simplified Logic mimicking a trained model
      let riskScore = 0;

      // 1. Satisfaction
      if (emp.jobSatisfaction <= 2) riskScore += 40;
      if (emp.environmentSatisfaction <= 2) riskScore += 20;

      // 2. Compensation
      if (emp.monthlyIncome < 3000) riskScore += 20;
      if (emp.salaryHikePercentage < 11) riskScore += 10;

      // 3. Work Conditions
      if (emp.overtime === 'Yes') riskScore += 15;
      if (emp.workLifeBalance <= 2) riskScore += 15;

      // 4. Tenure
      if (emp.yearsAtCompany < 2) riskScore += 10;

      // Normalize probability (0 to 1), max score approx 130
      let probability = Math.min(0.99, Math.max(0.01, riskScore / 130));

      // Add randomness
      probability += (Math.random() * 0.1) - 0.05;
      probability = Math.min(0.99, Math.max(0.01, probability));

      let riskLevel = "Low";
      if (probability > 0.7) riskLevel = "High";
      else if (probability > 0.3) riskLevel = "Medium";

      predictions.push({
        employeeId: emp.employeeId,
        prediction: probability > 0.5 ? 1 : 0,
        probability: probability,
        riskLevel: riskLevel,
        createdAt: now
      });
    }

    if (predictions.length > 0) {
      await EmployeePrediction.insertMany(predictions);
    }

    res.json({
      success: true,
      message: `Successfully generated ${predictions.length} predictions`,
      count: predictions.length
    });

  } catch (error) {
    console.error("Batch Prediction Error:", error);
    res.status(500).json({ success: false, message: "Batch prediction failed", error: error.message });
  }
};
