import express from "express";
import { getDashboardStats, getHighRiskEmployees } from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// router.get("/", authMiddleware, getDashboardStats);
router.get("/", getDashboardStats);
router.get("/high-risk", getHighRiskEmployees);

export default router;
