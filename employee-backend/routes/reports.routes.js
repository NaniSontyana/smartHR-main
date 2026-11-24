import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getReportsData } from "../controllers/reports.controller.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const router = express.Router();

// GET /api/reports — 120s cache (reports don't change frequently)
router.get("/", authMiddleware, cacheMiddleware(120, "reports"), getReportsData);

export default router;
