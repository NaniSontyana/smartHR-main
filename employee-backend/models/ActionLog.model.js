import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String, // 'communication', 'compensation', 'meeting', 'system'
    default: 'default'
  },
  employeeId: {
    type: String, // Reference to the employee being intervened with
    default: null
  },
  user: {
    type: String, // HR name
    default: 'Admin HR'
  },
  date: {
    type: String, // 'Just now', 'Today', or a timestamp
    default: 'Just now'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ActionLog = mongoose.model("ActionLog", actionLogSchema);

export default ActionLog;
