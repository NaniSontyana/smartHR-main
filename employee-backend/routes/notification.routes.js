import express from "express";
import { getNotifications, createNotification, markAsRead } from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.post("/", authMiddleware, createNotification);
router.patch("/:id/read", authMiddleware, markAsRead);

export default router;
