import mongoose from "mongoose";

const employeePredictionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true
    },
    prediction: {
      type: Number,
      required: true
    },
    probability: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "EmployeePrediction",
  employeePredictionSchema
);
