import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { SignInSchema, SignUpSchema } from "../../../types/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import isAuthenticated from '../../../middlewares/verifyToken.js'

const router = Router();
const prisma = new PrismaClient();



// router.use(session({
//     secret: process.env.SESSION_SECRET || "qljfe9KrD9HF3i+9b3B5xpdErJJbUF+rw9vgUoO61rg=",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60 * 60 * 1000 }
// }))

router.get("/", (req, res) => {
  // console.log(res)
  res.json({ message: "This is working" });
});

// Route for adding the user in database
router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    console.log("The request body is ", body);
    const parseData = SignUpSchema.safeParse(body);
    const userFound = await prisma.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });
    if (userFound && parseData.success) {
      res.status(400).json({ message: "User already exists" });
    } else if (parseData.success) {
      // console.log(parseData)
      const data = parseData.data;
      const hashPassword = await bcrypt.hash(data.password, 10);
      console.log(hashPassword);
      await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashPassword,
        },
      });
      res.status(200).json({ message: "User created successfully" });
    } else {
      res.status(404).json({ messgae: "Failed to create a user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Logging the user
router.post("/login", async (req, res) => {
  try {
    const body = req.body;
    const parseData = SignInSchema.safeParse(body);
    if (parseData.success) {
      const userFound = await prisma.user.findUnique({
        where: {
          email: parseData.data.email,
        },
      });
      if (userFound) {
        // const hashPassword = bcrypt.hash(parseData.data.password,10)
        const passwordMatch = await bcrypt.compare(
          parseData.data.password,
          userFound.password
        );
        console.log(passwordMatch);
        if (passwordMatch) {
          // console.log("signing jwt token");
          // console.log("JWT_SECRET",process.env.JWT_SECRET)
          // Session logic goes here
          const jwtToken = await jwt.sign(
            { id: userFound.id, email: userFound.email, name: userFound.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          console.log(jwtToken);
          // console.log("setting cookie");
          res.cookie("auth_token", jwtToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
          });

          res.cookie("user_data", JSON.stringify(userFound), {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
          })
          
          res.status(200).json({ message: "Login successfull" });
        } else {
          res.status(404).json({ message: "Invalid Credential" });
        }
      } else {
        res.status(403).json({ message: "Your are not signed in !!" });
      }
    } else {
      res.status(400).json({ message: "validation failed" });
    }
  } catch (error) {
    res.status(200).json({ message: "Error while logging user" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.clearCookie("user_data");
  res.status(200).json({ message: "Logout successfull" });
});

// const isAuthenticated = (req, res, next) => {
//   const auth_cookie = req.cookies.auth_token;
//   if (auth_cookie) {
//     jwt.verify(auth_cookie, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         res.status(401).json({ message: "Unauthorized" });
//       } else {
//         console.log(decoded);
//         next();
//       }
//     });
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

// Protected route example
router.get("/protected", isAuthenticated, (req, res) => {
  const user_data = JSON.parse(req.cookies.user_data)
  res.status(200).json({ message: `Welcome ${user_data.name}` });
});

export default router;
