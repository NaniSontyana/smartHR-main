import express from "express";
import { getRecommendations, getRetentionPlaybook } from "../controllers/recommendation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getRecommendations);
router.get("/playbook/:employeeId", authMiddleware, getRetentionPlaybook);

export default router;
