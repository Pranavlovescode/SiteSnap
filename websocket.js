import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function setUpWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    console.log("Headers:", socket.handshake.headers);
    const cookies = socket.handshake.headers.cookie;
    console.log("Cookies:", cookies);
    if (!cookies) {
      return next(new Error("Unauthorized: No cookies provided"));
    }

    const parsedCookies = cookie.parse(cookies);
    const authCookie = parsedCookies.auth_token;

    console.log("Parsed Cookie :", authCookie);
    if (!authCookie || authCookie === "null") {
      return next(new Error("Unauthorized: No token provided"));
    } else {
      jwt.verify(authCookie, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error("Unauthorized: Invalid token"));
        }
        socket.user = decoded;
        console.log(decoded)
        next();
      });
    }
  });

  io.on("connection", (socket) => {
    console.log("User is connected with id :", socket.id);

    // Handle events
    socket.on("message", async (msg) => {
      await prisma.testMessage.create({
        data: {
          message: msg,
          userId: socket.user.id,
        },
      });
      console.log(`Message from ${socket.user.email}: ${msg}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });
}
