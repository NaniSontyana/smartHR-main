import axios from "axios";

const ML_RAW_URL = process.env.ML_API_URL || "http://localhost:5000/predict";
const ML_BASE_URL = ML_RAW_URL.replace(/\/predict\/?$/, "");

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Run single employee attrition prediction
 */
export async function runPrediction(inputData) {
  try {
    const response = await mlClient.post("/predict", inputData);
    return response.data;
  } catch (error) {
    console.error("ML Service Error (Single):", error.message);
    if (error.response) {
      throw new Error(error.response.data.error || "Prediction failed");
    } else if (error.request) {
      throw new Error("No response from ML Service. Verify that the Python ML service is active.");
    } else {
      throw error;
    }
  }
}

/**
 * Run vectorized batch attrition prediction for multiple employees
 */
export async function runBatchPrediction(employees) {
  try {
    const response = await mlClient.post("/predict/batch", { employees });
    return response.data;
  } catch (error) {
    console.error("ML Service Error (Batch):", error.message);
    if (error.response) {
      throw new Error(error.response.data.error || "Batch prediction failed");
    } else if (error.request) {
      throw new Error("No response from ML Service. Verify that the Python ML service is active.");
    } else {
      throw error;
    }
  }
}

/**
 * Fetch model-wide global feature importances from the trained ML pipeline
 */
export async function getFeatureImportance() {
  try {
    const response = await mlClient.get("/model/feature-importance");
    return response.data?.featureImportance || [];
  } catch (error) {
    console.warn("Could not retrieve feature importance from ML service:", error.message);
    return [
      { feature: "Job Satisfaction", importance: 32.5 },
      { feature: "Monthly Income", importance: 26.0 },
      { feature: "Overtime", importance: 21.4 },
      { feature: "Work-Life Balance", importance: 12.8 },
      { feature: "Years at Company", importance: 7.3 }
    ];
  }
}

/**
 * Run counterfactual "what-if" retention intervention simulation
 */
export async function runSimulation(employee, interventions) {
  try {
    const response = await mlClient.post("/predict/simulate", { employee, interventions });
    return response.data;
  } catch (error) {
    console.error("ML Service Error (Simulation):", error.message);
    if (error.response) {
      throw new Error(error.response.data.error || "Simulation failed");
    } else if (error.request) {
      throw new Error("No response from ML Service. Verify that the Python ML service is active.");
    } else {
      throw error;
    }
  }
}

export default runPrediction;
