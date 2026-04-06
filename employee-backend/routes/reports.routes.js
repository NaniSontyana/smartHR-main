import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getReportsData } from "../controllers/reports.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getReportsData);

export default router;
