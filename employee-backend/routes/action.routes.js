import express from "express";
import { getActionLogs, createActionLog } from "../controllers/action.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getActionLogs);
router.post("/", authMiddleware, createActionLog);

export default router;
