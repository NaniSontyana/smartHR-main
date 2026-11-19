import ActionLog from "../models/ActionLog.model.js";
import { emitActionCreated, emitDashboardSync } from "../config/socket.js";

export const getActionLogs = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const query = employeeId ? { employeeId } : {};
    const logs = await ActionLog.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch action logs" });
  }
};

export const createActionLog = async (req, res) => {
  try {
    const { title, description, type, user, employeeId } = req.body;
    const log = await ActionLog.create({
      title,
      description,
      type,
      user: user || 'Admin HR',
      employeeId,
      date: 'Just now'
    });

    // Real-Time broadcast to all open HR dashboards
    emitActionCreated(log);
    emitDashboardSync();

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to create action log" });
  }
};
