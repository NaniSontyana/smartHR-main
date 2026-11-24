import express from "express";
import { getRecommendations, getRetentionPlaybook } from "../controllers/recommendation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const router = express.Router();

// GET /api/recommendations         — 90s cache
// GET /api/recommendations/playbook/:id — 300s cache (expensive generation)
router.get("/", authMiddleware, cacheMiddleware(90, "recommendations"), getRecommendations);
router.get("/playbook/:employeeId", authMiddleware, cacheMiddleware(300, "playbook"), getRetentionPlaybook);

export default router;
