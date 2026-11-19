import express from "express";
import http from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Fix for Node.js DNS resolution crash and SRV lookup on Windows
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS assignment is restricted by environment
}

dotenv.config();     // Load .env variables

import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import predictRoutes from "./routes/predict.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import emailRoutes from "./routes/email.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import actionRoutes from "./routes/action.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";

connectDB();         // Connect to MongoDB

const app = express();
const httpServer = http.createServer(app);

// Initialize Real-Time WebSocket Server
initSocket(httpServer);

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("CORS policy violation: Origin not allowed"));
  },
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: "1mb" }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication requests, please try again after 15 minutes" }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" }
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/employees", apiLimiter, employeeRoutes);
app.use("/api/predict", apiLimiter, predictRoutes);
app.use("/api/dashboard", apiLimiter, dashboardRoutes);
app.use("/api/reports", apiLimiter, reportsRoutes);
app.use("/api/email", apiLimiter, emailRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/actions", apiLimiter, actionRoutes);
app.use("/api/recommendations", apiLimiter, recommendationRoutes);

// Health Check Endpoint (Liveness & Readiness probe)
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const statusCode = dbStatus === "connected" ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus
    }
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Employee Attrition API (Production Ready)");
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (HTTP & WebSockets enabled)`);
});
