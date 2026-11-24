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
import { connectRedis, isRedisUp } from "./config/redis.js";
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
connectRedis();      // Connect to Redis cache (graceful if unavailable)

const app = express();
const httpServer = http.createServer(app);

// Initialize Real-Time WebSocket Server
initSocket(httpServer);

// ── CORS MUST come BEFORE Helmet so preflight (OPTIONS) responses are
// ── sent immediately without Helmet blocking them. ──────────────────
const corsOptions = {
  origin: true,                 // reflect request origin → Access-Control-Allow-Origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  maxAge: 86400                 // cache preflight for 24 h
};
app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));   // explicit preflight (Express 5 syntax)

// Security Headers — disable every cross-origin header that conflicts with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,   // do NOT send Cross-Origin-Resource-Policy
  crossOriginOpenerPolicy: false,     // do NOT send Cross-Origin-Opener-Policy
  crossOriginEmbedderPolicy: false    // do NOT send Cross-Origin-Embedder-Policy
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
app.use("/auth", authLimiter, authRoutes);

app.use("/api/employees", apiLimiter, employeeRoutes);
app.use("/employees", apiLimiter, employeeRoutes);

app.use("/api/predict", apiLimiter, predictRoutes);
app.use("/predict", apiLimiter, predictRoutes);

app.use("/api/dashboard", apiLimiter, dashboardRoutes);
app.use("/dashboard", apiLimiter, dashboardRoutes);

app.use("/api/reports", apiLimiter, reportsRoutes);
app.use("/reports", apiLimiter, reportsRoutes);

app.use("/api/email", apiLimiter, emailRoutes);
app.use("/email", apiLimiter, emailRoutes);

app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/notifications", apiLimiter, notificationRoutes);

app.use("/api/actions", apiLimiter, actionRoutes);
app.use("/actions", apiLimiter, actionRoutes);

app.use("/api/recommendations", apiLimiter, recommendationRoutes);
app.use("/recommendations", apiLimiter, recommendationRoutes);

// Health Check Endpoint (Liveness & Readiness probe)
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const cacheStatus = isRedisUp() ? "connected" : "unavailable";
  const statusCode = dbStatus === "connected" ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      cache: cacheStatus
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
