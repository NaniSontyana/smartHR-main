import express from "express";
import { sendReviewEmail } from "../controllers/email.controller.js";

const router = express.Router();

// POST /api/email/send
router.post("/send", sendReviewEmail);

export default router;
