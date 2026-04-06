import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: false
  },

  department: {
    type: String,
    required: true
  },

  jobRole: {
    type: String,
    required: false
  },

  inputs: {
    type: Object,
    required: true
  },

  prediction: {
    type: Number,
    enum: [0, 1],
    required: true
  },

  probability: {
    type: Number,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Prediction", predictionSchema);
