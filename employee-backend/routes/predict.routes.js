import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { predictAttrition, runBatchPredictions, simulateIntervention } from "../controllers/predict.controller.js";

const router = express.Router();

router.post("/", authMiddleware, predictAttrition);
router.post("/batch", authMiddleware, runBatchPredictions);
router.post("/simulate", authMiddleware, simulateIntervention);

export default router;
