import { PrismaClient } from "@prisma/client";
import { SignUpSchema } from "../types/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const signupController = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log("The request body is ", email, name, password);
    // const parseData = SignUpSchema.safeParse(body);
    const userFound = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log("user found", userFound);
    if (userFound) {
      console.log("User already exists");
      res.status(400).json({ message: "User already exists" });
    } else if (userFound == null) {
      // console.log(parseData)
      // const data = body;
      const hashPassword = await bcrypt.hash(password, 10);
      console.log(hashPassword);
      await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashPassword || null,
        },
      });
      res.status(200).json({ message: "User created successfully" });
    } else {
      res
        .status(404)
        .json({ messgae: "Failed to create a user from else part" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to create user from catch" });
  }
};
export const signupWithGoogle = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log("The request body is ", email, name, password);
    // const parseData = SignUpSchema.safeParse(body);
    const userFound = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log("user found", userFound);
    if (userFound) {
      console.log("User already exists");
      const jwtToken = await jwt.sign(
        { email: email, name: name },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      console.log("Jwt token created", jwtToken);

      const cookieToken = res.cookie("auth_token", jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        domain: "localhost",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("Cookie token created", cookieToken);

      res.status(200).json({ message: "User Login Successfull" });
    } else if (userFound == null) {
      // console.log(parseData)
      // const data = body;
      // const hashPassword = await bcrypt.hash(password, 10);
      // console.log(hashPassword);
      await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: null,
        },
      });

      res.status(200).json({ message: "User created successfully" });
    } else {
      res
        .status(404)
        .json({ messgae: "Failed to create a user from else part" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to create user from catch" });
  }
};
