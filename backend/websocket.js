import { Server } from "socket.io";
import { parse } from "cookie";

import express from "express";
import http from "http";
import { getSession } from "./sessionHelper.js"; // Helper to get NextAuth session
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load appropriate env file
dotenv.config({ 
  path: process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, ".env.production")
    : path.resolve(__dirname, ".env"),
});

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    console.log("Headers:", socket.handshake.auth.token);

    // Extract session token from cookies
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("No cookies found");
      return next(new Error("Unauthorized: No session token found"));
    }

    const parsedCookies = parse(token);
    const sessionToken =
      parsedCookies["next-auth.session-token"] || parsedCookies["__Secure-next-auth.session-token"];

    console.log("Parsed Session Token:", sessionToken);
    if (!sessionToken) {
      return next(new Error("Unauthorized: No session provided"));
    }

    // Retrieve session
    const session = await getSession(sessionToken);
    console.log("Session Data:", session);

    if (!session || !session.user) {
      return next(new Error("Unauthorized: Invalid session"));
    }

    // Check if user exists in DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return next(new Error("Unauthorized: User does not exist"));
    }

    socket.user = user;
    console.log("Authenticated User:", user.email);

    next();
  } catch (error) {
    console.error("WebSocket Auth Error:", error);
    return next(new Error("Internal Server Error"));
  }
});

io.on("connection", (socket) => {
  console.log(`✅ User Connected: ${socket.user.email} (ID: ${socket.id})`);

  socket.on("message", async (msg) => {
    io.emit("message-server", msg);
    console.log(`💬 Message from ${socket.user.email}: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected: ${socket.user.email}`);
  });
  socket.on("team-message", (id) => {
    console.log(`📢 Team Message Received from ${socket.user.email}:`, id);
  });

  socket.on("upload-image", async (data) => {
    console.log(`📸 Image Received from ${socket.user.email}`);
    io.emit("process-status", {
      success: true,
      message: "Image processed successfully!",
      path: data,
    });
  });
});

const PORT = process.env.WEBSOCKET_PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket Server running on port ${PORT}`);
});
