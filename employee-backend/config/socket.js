import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
    : ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "http://localhost:80"];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        return callback(new Error("CORS policy violation for WebSocket"));
      },
      credentials: true,
      methods: ["GET", "POST"]
    },
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // JWT Authentication Middleware for WebSockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        console.warn("⚠️ WebSocket token verification failed:", err.message);
      }
    }
    return next();
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected via WebSocket [id: ${socket.id}] ${socket.user ? `(user: ${socket.user.id || socket.user.role})` : "(guest)"}`);

    // Join common rooms
    socket.join("general");
    if (socket.user) {
      socket.join("authenticated");
      if (socket.user.role === "HR" || socket.user.role === "admin") {
        socket.join("admins");
      }
    }

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected [id: ${socket.id}, reason: ${reason}]`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Real-Time Event Dispatchers
 */
export const emitNotification = (notification) => {
  if (io) {
    io.to("general").emit("notification:new", notification);
  }
};

export const emitBatchProgress = (progressData) => {
  if (io) {
    io.to("general").emit("batch:progress", progressData);
  }
};

export const emitDashboardSync = () => {
  if (io) {
    io.to("general").emit("dashboard:sync");
  }
};

export const emitActionCreated = (action) => {
  if (io) {
    io.to("general").emit("action:created", action);
  }
};

export const emitEmployeesChanged = (eventData) => {
  if (io) {
    io.to("general").emit("employees:changed", eventData);
    io.to("general").emit("dashboard:sync");
  }
};
