import express from "express";
import { getDashboardStats, getHighRiskEmployees } from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const router = express.Router();

// GET /api/dashboard        — 60s cache (busted on every new prediction)
// GET /api/dashboard/high-risk — 30s cache
router.get("/", authMiddleware, cacheMiddleware(60, "dashboard"), getDashboardStats);
router.get("/high-risk", authMiddleware, cacheMiddleware(30, "dashboard"), getHighRiskEmployees);

export default router;
