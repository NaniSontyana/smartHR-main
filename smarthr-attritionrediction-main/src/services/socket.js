import { io } from "socket.io-client";

let rawSocketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
if (!rawSocketUrl.startsWith('http://') && !rawSocketUrl.startsWith('https://')) {
  rawSocketUrl = `https://${rawSocketUrl}`;
}
if (rawSocketUrl.includes('retainiq-backend') && !rawSocketUrl.includes('.onrender.com')) {
  try {
    const urlObj = new URL(rawSocketUrl);
    if (!urlObj.hostname.includes('.onrender.com') && urlObj.hostname.startsWith('retainiq-backend')) {
      urlObj.hostname = `${urlObj.hostname}.onrender.com`;
      rawSocketUrl = urlObj.toString();
    }
  } catch (e) {
    console.warn("Could not parse socket API URL:", e);
  }
}

// Derive socket base URL by stripping /api
const SOCKET_URL = rawSocketUrl.replace(/\/api\/?$/, "");

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: {
        token: token || ""
      },
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to RetainIQ™ Real-Time WebSocket Hub:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from WebSocket Hub:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection issue:", err.message);
    });
  }

  return socket;
};

export const updateSocketToken = (newToken) => {
  if (socket) {
    socket.auth = { token: newToken };
    if (!socket.connected) {
      socket.connect();
    }
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
