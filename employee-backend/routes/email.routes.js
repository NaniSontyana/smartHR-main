import express from "express";
import { sendReviewEmail } from "../controllers/email.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/email/send - Protected
router.post("/send", authMiddleware, sendReviewEmail);

export default router;
