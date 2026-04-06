import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

// Fix for Node.js DNS resolution crash on Windows (exit code -1073741510)
dns.setDefaultResultOrder('ipv4first');

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import predictRoutes from "./routes/predict.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import emailRoutes from "./routes/email.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import actionRoutes from "./routes/action.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";

dotenv.config();     // Load .env variables
connectDB();         // Connect to MongoDB

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Employee Attrition API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
