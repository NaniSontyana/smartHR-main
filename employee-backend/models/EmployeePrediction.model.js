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
    factors: [
      {
        name: { type: String },
        impact: { type: Number },
        description: { type: String }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

// Compound indexes for rapid high-risk lookups and dashboard queries
employeePredictionSchema.index({ employeeId: 1, createdAt: -1 });
employeePredictionSchema.index({ riskLevel: 1, createdAt: -1 });
employeePredictionSchema.index({ createdAt: -1, probability: -1 });

export default mongoose.model(
  "EmployeePrediction",
  employeePredictionSchema
);
