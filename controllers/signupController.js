import { PrismaClient } from "@prisma/client";
import { SignUpSchema } from "../types/index.js";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();

export const signupController = async (req, res) => {
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
};
