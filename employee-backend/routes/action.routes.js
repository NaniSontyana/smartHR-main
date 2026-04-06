import express from "express";
import { getActionLogs, createActionLog } from "../controllers/action.controller.js";

const router = express.Router();

router.get("/", getActionLogs);
router.post("/", createActionLog);

export default router;
