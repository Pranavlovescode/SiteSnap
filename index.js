import dotenv from "dotenv";
dotenv.config();

import express from "express";
import loginRouter from "./routes/auth.js";
import teamRouter from "./routes/team.js";
import uploadImageRouter from "./routes/upload-image.js"
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import setUpWebSocket from "./websocket.js";
import passport from "passport";
import { initializePassport } from "./config/passport-local.js";
import session from "express-session";
import path from "path";

const app = express();
const server = http.createServer(app);

// io.on("connection",(socket)=>{
//     console.log("User is connected with id :",socket.id)
// })

// Setting up the CORS policy
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

// Used to store session data
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24*60 * 60 * 1000 }, // 24 hours
  })
);

// Used to for google login
app.use(passport.initialize());
app.use(passport.session())
app.use(passport.authenticate("session"))

initializePassport(passport);

app.use(express.static(path.join(path.resolve(), "")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.use("/api/v1/", loginRouter);
app.use("/api/v1/", teamRouter);
app.use("/api/v1/image",uploadImageRouter)
setUpWebSocket(server);

server.listen(5000, () => {
  console.log("Server is running !!");
});
