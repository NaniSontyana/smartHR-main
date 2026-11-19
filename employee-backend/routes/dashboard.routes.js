import express from "express";
import { getDashboardStats, getHighRiskEmployees } from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/dashboard - Protected
router.get("/", authMiddleware, getDashboardStats);
router.get("/high-risk", authMiddleware, getHighRiskEmployees);

export default router;
