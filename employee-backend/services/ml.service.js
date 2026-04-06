import axios from "axios";

// In a real production app, this URL should be in .env
const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000/predict";

export default async function runPrediction(inputData) {
  try {
    const response = await axios.post(ML_API_URL, inputData);
    return response.data;
  } catch (error) {
    console.error("ML Service Error:", error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.error || "Prediction failed");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from ML Service. Is the Flask app running?");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
}
