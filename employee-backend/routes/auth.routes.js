import express from "express";
import {
  signUp,
  signIn,
  signOut,
  sendOtp,
  verifyOtp,
  getMe,
  updateMe
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

export default router;
