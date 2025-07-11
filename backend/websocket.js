import { Server } from "socket.io";
import express from "express";
import http from "http";
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
    : path.resolve(__dirname, ".env.development"),
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

// io.use(async (socket, next) => {
//   try {
//     console.log("Headers:", socket.handshake.auth.token);

//     // Extract session token from cookies
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       console.log("No cookies found");
//       return next(new Error("Unauthorized: No session token found"));
//     }

//     const sessionToken = token;


//     console.log("Parsed Session Token:", sessionToken);
//     if (!sessionToken) {
//       return next(new Error("Unauthorized: No session provided"));
//     }

//     // Retrieve session
//     const session = await getSession(sessionToken);
//     console.log("Session Data:", session);

//     if (!session || !session.user) {
//       return next(new Error("Unauthorized: Invalid session"));
//     }

//     // Check if user exists in DB
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return next(new Error("Unauthorized: User does not exist"));
//     }

//     socket.user = user;
//     console.log("Authenticated User:", user.email);

//     next();
//   } catch (error) {
//     console.error("WebSocket Auth Error:", error);
//     return next(new Error("Internal Server Error"));
//   }
// });

// updated middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log("🔐 Received Token:", token);

    if (!token) {
      return next(new Error("Unauthorized: No session token provided"));
    }

    // const session = await getSession(token);
    // console.log("🧾 Session:", session);

    // if (!session || !session.user) {
    //   return next(new Error("Unauthorized: Invalid session"));
    // }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
    });

    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    socket.user = user;
    console.log("✅ Authenticated User:", user.email);

    next();
  } catch (error) {
    console.error("🔥 WebSocket Auth Error:", error.message);
    next(new Error("Internal Server Error"));
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
